import axios from 'axios';
import * as log from 'loglevel';
import {
  MaintenanceState,
  NotificationType,
  ScheduledMaintenanceState,
} from '../state/scigateway.types';
import { OIDCProvider } from '../state/state.types';
import BaseAuthProvider from './baseAuthProvider';
import parseJwt from './parseJwt';

export function fetchOIDCConfig(oidcConfigurationUrl?: string): Promise<{
  authorization_endpoint: string;
  token_endpoint: string;
}> {
  return axios
    .get<{
      authorization_endpoint: string;
      token_endpoint: string;
      [key: string]: unknown;
    }>(`${oidcConfigurationUrl}`)
    .then((res) => {
      return {
        authorization_endpoint: res.data.authorization_endpoint,
        token_endpoint: res.data.token_endpoint,
      };
    })
    .catch((e) => {
      log.error('Unable to fetch OIDC config from OIDC configuration URL');
      document.dispatchEvent(
        new CustomEvent('scigateway', {
          detail: {
            type: NotificationType,
            payload: {
              message:
                'It is not possible to authenticate you at the moment. Please, try again later.',
              severity: 'error',
            },
          },
        })
      );
      throw e;
    });
}

export function fetchOIDCProviders(authUrl?: string): Promise<OIDCProvider[]> {
  return axios
    .get<Record<string, Omit<OIDCProvider, 'provider_id'>>>(
      `${authUrl}/oidc_providers`
    )
    .then((res) => {
      return Object.entries(res.data).map(([key, op]) => ({
        provider_id: key,
        ...op,
      }));
    })
    .catch(() => {
      log.error('Unable to fetch OIDC providers');
      document.dispatchEvent(
        new CustomEvent('scigateway', {
          detail: {
            type: NotificationType,
            payload: {
              message:
                'It is not possible to authenticate you at the moment. Please, try again later.',
              severity: 'error',
            },
          },
        })
      );
      return [];
    });
}

/**
 * Code for generating code verifier and code challenge for use
 * with OAuth Authorization Code Flow with Proof Key for Code Exchange (PKCE)
 * see: https://stackoverflow.com/a/63336562/7458681
 *  */
export function generateCodeVerifier(): string {
  const array = new Uint32Array(56 / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec2hex).join('');
}

function dec2hex(dec: number): string {
  return ('0' + dec.toString(16)).slice(-2);
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  // returns promise ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(a: ArrayBuffer): string {
  let str = '';
  const bytes = new Uint8Array(a);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function generateCodeChallengeFromVerifier(
  v: string
): Promise<string> {
  const hashed = await sha256(v);
  const base64encoded = base64urlencode(hashed);
  return base64encoded;
}

export interface InitialisedOIDCProvider extends OIDCProvider {
  authorization_endpoint: string;
  token_endpoint: string;
}

export default abstract class BaseAPIAuthProvider extends BaseAuthProvider {
  public constructor(authUrl: string | undefined) {
    super(authUrl);
  }

  public userPassLogIn(
    postBody: unknown,
    preProcessing?: () => unknown
  ): Promise<void> {
    return axios
      .post(`${this.authUrl}/login`, postBody)
      .then((res) => {
        if (preProcessing) preProcessing();
        this.storeToken(res.data);
        const user: {
          username: string;
          userIsAdmin: boolean;
          avatarUrl: string;
        } = JSON.parse(parseJwt(res.data));
        this.storeUser(user.username, user.userIsAdmin, user.avatarUrl);
        return;
      })
      .catch((err) => {
        this.handleAuthError(err);
      });
  }

  async pkceToken(
    token: string,
    oidcProvider: InitialisedOIDCProvider
  ): Promise<string> {
    const params = new URLSearchParams();

    params.append('code', token);
    params.append('code_verifier', sessionStorage.getItem('codeVerifier')!);
    params.append('client_id', oidcProvider.client_id);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', `${window.location.origin}/login`);

    const {
      data: { id_token },
    } = await axios.post(oidcProvider.token_endpoint, params);

    return id_token;
  }

  async nonPKCEToken(
    token: string,
    oidcProvider: InitialisedOIDCProvider
  ): Promise<string> {
    const {
      data: { id_token },
    } = await axios.post(
      `${this.authUrl}/oidc_token/${oidcProvider.provider_id}`,
      token,
      { headers: { 'Content-Type': 'application/json' } }
    );

    return id_token;
  }

  public async oidcLogIn(
    token: string,
    oidcProvider: InitialisedOIDCProvider,
    preProcessing?: () => unknown
  ): Promise<void> {
    try {
      let id_token;
      if (oidcProvider.pkce) {
        id_token = await this.pkceToken(token, oidcProvider);
      } else {
        id_token = await this.nonPKCEToken(token, oidcProvider);
      }

      // TODO: sometimes login request fails here - maybe because it was too fast?

      const { data: jwt } = await axios.post(
        `${this.authUrl}/oidc_login/${oidcProvider.provider_id}`,
        undefined,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        }
      );
      if (preProcessing) preProcessing();
      this.storeToken(jwt);
      sessionStorage.removeItem('codeVerifier');
      sessionStorage.removeItem('oidcProviderId');
      const payload: {
        sessionId: string;
        username: string;
        userIsAdmin: boolean;
      } = JSON.parse(parseJwt(jwt));
      this.storeUser(payload.username, payload.userIsAdmin);
      return;
    } catch (err) {
      // reset OIDC config on fail before handling error to set up for a potential retry
      this.setupOIDC(oidcProvider);
      this.handleAuthError(err);
    }
  }

  public async setupOIDC(oidcProvider: InitialisedOIDCProvider): Promise<void> {
    let codeChallenge: string | undefined;
    if (oidcProvider.pkce) {
      const codeVerifier = generateCodeVerifier();
      sessionStorage.setItem('codeVerifier', codeVerifier);
      codeChallenge = await generateCodeChallengeFromVerifier(codeVerifier);
    }
    sessionStorage.setItem('oidcProviderId', oidcProvider.provider_id);

    this.redirectUrl = `${oidcProvider.authorization_endpoint}?client_id=${oidcProvider.client_id}&redirect_uri=${window.location.origin}/login&response_type=code${oidcProvider.pkce ? `&code_challenge_method=S256&code_challenge=${codeChallenge}` : ''}&scope=${oidcProvider.scope}`;
  }

  public async initialiseOIDCProviders(): Promise<InitialisedOIDCProvider[]> {
    const oidcProviders = await fetchOIDCProviders(this.authUrl);
    return await Promise.all(
      oidcProviders.map(async (oidcProvider) => {
        const config = await fetchOIDCConfig(oidcProvider.configuration_url);
        return { ...config, ...oidcProvider };
      })
    );
  }

  public verifyLogIn(): Promise<void> {
    return axios
      .post(`${this.authUrl}/verify`, {
        token: this.token,
      })
      .then(() => {
        // do nothing
      })
      .catch(() => this.refresh());
  }

  public refresh(): Promise<void> {
    return axios
      .post(`${this.authUrl}/refresh`, {
        token: this.token,
      })
      .then((res) => {
        this.storeToken(res.data);
      })
      .catch((err) => this.handleRefreshError(err));
  }

  public fetchScheduledMaintenanceState(): Promise<ScheduledMaintenanceState> {
    return axios
      .get(`${this.authUrl}/scheduled_maintenance`)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        this.handleAuthError(err);
      });
  }

  public fetchMaintenanceState(): Promise<MaintenanceState> {
    return axios
      .get(`${this.authUrl}/maintenance`)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        this.handleAuthError(err);
      });
  }

  public setScheduledMaintenanceState(
    scheduledMaintenanceState: ScheduledMaintenanceState
  ): Promise<string | void> {
    return axios
      .put(`${this.authUrl}/scheduled_maintenance`, scheduledMaintenanceState, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .then((res) => {
        if (res?.data) {
          return res.data;
        }
      })
      .catch((err) => {
        this.handleAuthError(err);
      });
  }

  public setMaintenanceState(
    maintenanceState: MaintenanceState
  ): Promise<string | void> {
    return axios
      .put(`${this.authUrl}/maintenance`, maintenanceState, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .then((res) => {
        if (res?.data) {
          return res.data;
        }
      })
      .catch((err) => {
        this.handleAuthError(err);
      });
  }
}
