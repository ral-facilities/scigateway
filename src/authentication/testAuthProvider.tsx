import {
  MaintenanceState,
  ScheduledMaintenanceState,
} from '../state/scigateway.types';
import { AuthProvider } from '../state/state.types';

export default class TestAuthProvider implements AuthProvider {
  private token: string | null;
  public redirectUrl: string | null;
  public user = null;
  public mnemonic: string | undefined;
  public authUrl: string | undefined;
  public autoLogin?: () => Promise<void>;

  public constructor(token: string | null) {
    this.token = token;
    this.redirectUrl = null;
  }

  public isLoggedIn(): boolean {
    return this.token !== null;
  }

  public isAdmin(): boolean {
    return true;
  }

  public logOut(): void {
    this.token = null;
  }

  public logIn(username: string, password: string): Promise<void> {
    if (username === 'username' && password === 'password') {
      this.token = 'validLoginToken';
      return Promise.resolve();
    }

    this.logOut();
    return Promise.reject('test auth provider');
  }

  public verifyLogIn(): Promise<void> {
    return this.refresh();
  }

  public refresh(): Promise<void> {
    return Promise.reject('test auth provider');
  }

  public fetchScheduledMaintenanceState(): Promise<ScheduledMaintenanceState> {
    return Promise.resolve({
      show: false,
      message: 'test',
    });
  }

  public fetchMaintenanceState(): Promise<MaintenanceState> {
    return Promise.resolve({
      show: false,
      message: 'test',
    });
  }

  public setScheduledMaintenanceState(
    scheduledMaintenanceState: ScheduledMaintenanceState
  ): Promise<string | void> {
    return Promise.resolve('test');
  }

  public setMaintenanceState(
    maintenanceState: MaintenanceState
  ): Promise<string | void> {
    return Promise.resolve('test');
  }
}

export class NonAdminTestAuthProvider extends TestAuthProvider {
  isAdmin(): boolean {
    return false;
  }
}
