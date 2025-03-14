import Axios from 'axios';
import type {
  MaintenanceState,
  ScheduledMaintenanceState,
} from '../state/scigateway.types';
import BaseAuthProvider from './baseAuthProvider';
import parseJwt from './parseJwt';

export default class JWTAuthProvider extends BaseAuthProvider {
  public logIn(username: string, password: string): Promise<void> {
    if (this.isLoggedIn()) {
      return Promise.resolve();
    }

    return Axios.post(`${this.authUrl}/login`, {
      username,
      password,
    })
      .then((res) => {
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
      .catch((err) => this.handleRefreshError(err));
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
    return Axios.post(
      `${this.authUrl}/scheduled_maintenance`,
      scheduledMaintenanceState,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    )
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
    return Axios.post(`${this.authUrl}/maintenance`, maintenanceState, {
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
