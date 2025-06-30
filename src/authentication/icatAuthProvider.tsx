import Axios from 'axios';
import {
  MaintenanceState,
  ScheduledMaintenanceState,
} from '../state/scigateway.types';
import BaseAuthProvider, { fetchOIDCConfig } from './baseAuthProvider';
import parseJwt from './parseJwt';
export default class ICATAuthProvider extends BaseAuthProvider {
  public mnemonic: string;

  public constructor(mnemonic?: string, authUrl?: string, autoLogin?: boolean) {
    super(authUrl);
    this.mnemonic = mnemonic || '';
    this.autoLogin = autoLogin ? this.autoLoginFunc.bind(this) : undefined;
  }

  private autoLoginFunc = (): Promise<void> => {
    const prevMnemonic = this.mnemonic;
    this.mnemonic = 'anon';
    return this.logIn('', '')
      .then(() => localStorage.setItem('autoLogin', 'true'))
      .catch((err) => {
        localStorage.setItem('autoLogin', 'false');
        throw err;
      })
      .finally(() => {
        this.mnemonic = prevMnemonic;
      });
  };

  // this has to be defined in the constructor to know whether it should exist or not
  public autoLogin;

  private async oidcLogIn(
    token: string,
    configurationUrl: string
  ): Promise<void> {
    const config = await fetchOIDCConfig(configurationUrl);
    const params = new URLSearchParams();
    params.append('client_id', sessionStorage.getItem('oidcClientId')!);
    params.append('grant_type', 'authorization_code');
    params.append('code', token);
    params.append('code_verifier', sessionStorage.getItem('codeVerifier')!);
    params.append('redirect_uri', `${window.location.origin}/login`);

    try {
      const {
        data: { id_token },
      } = await Axios.post(`${config.token_endpoint}`, params);

      const { data: jwt } = await Axios.post(
        `${this.authUrl}/oidc_login`,
        undefined,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        }
      );

      if (this.isLoggedIn() && localStorage.getItem('autoLogin') === 'true') {
        this.logOut();
      }
      this.storeToken(jwt);
      localStorage.setItem('autoLogin', 'false');
      const payload: {
        sessionId: string;
        username: string;
        userIsAdmin: boolean;
      } = JSON.parse(parseJwt(jwt));
      this.storeUser(payload.username, payload.userIsAdmin);
      return;
    } catch (err) {
      this.handleAuthError(err);
    }
  }

  public logIn(username: string, password: string): Promise<void> {
    if (this.mnemonic.startsWith('oidc_')) {
      const params = new URLSearchParams(password);
      const code = params.get('code');
      if (code) return this.oidcLogIn(code, this.mnemonic.split('oidc_')[1]);
      else {
        // TODO: handle no code?
      }
    }

    if (this.isLoggedIn() && localStorage.getItem('autoLogin') !== 'true') {
      return Promise.resolve();
    }

    return Axios.post(`${this.authUrl}/login`, {
      mnemonic: this.mnemonic,
      credentials: {
        username,
        password,
      },
    })
      .then((res) => {
        if (this.isLoggedIn() && localStorage.getItem('autoLogin') === 'true') {
          this.logOut();
        }
        this.storeToken(res.data);
        localStorage.setItem('autoLogin', 'false');
        const payload: {
          sessionId: string;
          username: string;
          userIsAdmin: boolean;
        } = JSON.parse(parseJwt(res.data));
        this.storeUser(payload.username, payload.userIsAdmin);
        return;
      })
      .catch((err) => {
        this.handleAuthError(err);
      });
  }

  public verifyLogIn(): Promise<void> {
    return Axios.post(`${this.authUrl}/verify`, {
      token: this.token,
    })
      .then(() => {
        // do nothing
      })
      .catch(() => this.refresh());
  }

  public refresh(): Promise<void> {
    return Axios.post(`${this.authUrl}/refresh`, {
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
    return Axios.get(`${this.authUrl}/scheduled_maintenance`)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        this.handleAuthError(err);
      });
  }

  public fetchMaintenanceState(): Promise<MaintenanceState> {
    return Axios.get(`${this.authUrl}/maintenance`)
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
    return Axios.put(`${this.authUrl}/scheduled_maintenance`, {
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
    return Axios.put(`${this.authUrl}/maintenance`, {
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
