import axios from 'axios';
import * as log from 'loglevel';
import {
  MaintenanceState,
  NotificationType,
  ScheduledMaintenanceState,
} from '../state/scigateway.types';
import { Authenticator, OIDCProvider } from '../state/state.types';
import BaseAuthProvider, { fetchOIDCConfig } from './baseAuthProvider';

// TODO: when to send this request? what to do on error?
export function fetchOIDCProviders(authUrl?: string): Promise<OIDCProvider[]> {
  return axios
    .get<OIDCProvider[]>(`${authUrl}/oidc_providers`)
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      log.error(
        'It is not possible to authenticate you at the moment. Please, try again later'
      );
      document.dispatchEvent(
        new CustomEvent('scigateway', {
          detail: {
            type: NotificationType,
            payload: {
              message:
                'It is not possible to authenticate you at the moment. Please, try again later',
              severity: 'error',
            },
          },
        })
      );
      return [];
    });
}

// GENERATING CODE VERIFIER
function dec2hex(dec: number): string {
  return ('0' + dec.toString(16)).substr(-2);
}

export function generateCodeVerifier(): string {
  const array = new Uint32Array(56 / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec2hex).join('');
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

export default class OIDCAuthProvider extends BaseAuthProvider {
  public oidcProviders: InitialisedOIDCProvider[];
  private oidcProvider: InitialisedOIDCProvider | null;
  private authInitialised: boolean;
  public authenticators: Authenticator[];

  public constructor(authUrl?: string) {
    super(authUrl);
    this.oidcProviders = [];
    this.oidcProvider = null;
    this.redirectUrl = 'unknown'; // gets filled in later
    this.authInitialised = false;
    this.authenticators = [];
  }

  public async initialise(): Promise<void> {
    try {
      if (!this.authInitialised) {
        const oidcProviders = await fetchOIDCProviders(this.authUrl);
        oidcProviders.forEach(async () => {});
        this.oidcProviders = await Promise.all(
          oidcProviders.map(async (oidcProvider) => {
            const config = await fetchOIDCConfig(
              oidcProvider.configuration_url
            );
            return { ...config, ...oidcProvider };
          })
        );
        this.authInitialised = true;
        this.authenticators = this.oidcProviders.map((op) => ({
          key: op.configuration_url,
          displayName: op.display_name,
          type: 'redirect',
        }));
      }
      // re-run this on init to ensure we re-setup any OIDC stuff
      if (this.oidcProviders.length === 1)
        this.setAuthenticator(this.oidcProviders[0].configuration_url);
    } catch {
      // TODO
    }
  }

  public getAuthenticator(): string {
    return this.oidcProvider?.configuration_url ?? '';
  }

  public async setAuthenticator(
    provider: string,
    disableSideEffects?: boolean
  ): Promise<void> {
    const oidcProvider = this.oidcProviders.find(
      (oidc) => oidc.configuration_url === provider
    );
    if (oidcProvider) {
      this.oidcProvider = oidcProvider;
      if (!disableSideEffects) {
        const codeVerifier = generateCodeVerifier();
        sessionStorage.setItem('codeVerifier', codeVerifier);
        sessionStorage.setItem(
          'oidcConfigurationUrl',
          oidcProvider.configuration_url
        );
        sessionStorage.setItem('oidcClientId', oidcProvider.client_id);

        const codeChallenge =
          await generateCodeChallengeFromVerifier(codeVerifier);
        this.redirectUrl = `${oidcProvider.authorization_endpoint}?client_id=${oidcProvider.client_id}&redirect_uri=${window.location.origin}/login&response_type=code&code_challenge_method=S256&code_challenge=${codeChallenge}&scope=openid`;
      }
    } else {
      log.error(
        `Can't find oidc provider matching the specified authenticator: ${provider}`
      );
    }
  }

  public logIn(_username: string, password: string): Promise<void> {
    const params = new URLSearchParams(password);
    const code = params.get('code');

    if (!code || !this.oidcProvider) {
      this.logOut();
      return Promise.resolve();
    }

    return this.oidcLogIn(code, this.oidcProvider?.configuration_url);
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
      .catch((err) => {
        this.handleRefreshError(err);
      });
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
      .put(`${this.authUrl}/scheduled_maintenance`, {
        token: this.token,
        scheduledMaintenance: scheduledMaintenanceState,
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
      .put(`${this.authUrl}/maintenance`, {
        token: this.token,
        maintenance: maintenanceState,
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
