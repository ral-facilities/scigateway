import Axios from 'axios';
import BaseAuthProvider from './baseAuthProvider';
import ReactGA from 'react-ga';
import parseJwt from './parseJwt';
import { ScheduledMaintenanceState } from '../state/scigateway.types';
import { MaintenanceState } from '../state/scigateway.types';
export default class ICATAuthProvider extends BaseAuthProvider {
  public mnemonic: string;
  public autoLogin: () => Promise<void>;

  public constructor(
    mnemonic: string | undefined,
    authUrl: string | undefined
  ) {
    super(authUrl);
    this.mnemonic = mnemonic || '';
    if (this.mnemonic === '') {
      this.mnemonic = 'anon';
      this.autoLogin = () =>
        this.logIn('', '')
          .then(() => localStorage.setItem('autoLogin', 'true'))
          .catch((err) => {
            localStorage.setItem('autoLogin', 'false');
            throw err;
          })
          .finally(() => {
            this.mnemonic = '';
          });
    } else {
      this.autoLogin = () => Promise.resolve();
    }
  }

  public logIn(username: string, password: string): Promise<void> {
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
        ReactGA.event({
          category: 'Login',
          action: 'Successfully logged in via JWT',
        });
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
        ReactGA.event({
          category: 'Login',
          action: 'Failed to log in via JWT',
        });
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
