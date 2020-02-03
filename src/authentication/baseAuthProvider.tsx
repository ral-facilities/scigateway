import { AuthProvider, User } from '../state/state.types';
import UserInfo from './user';

const tokenLocalStorageName = 'scigateway:token';

export default abstract class BaseAuthProvider implements AuthProvider {
  abstract logIn(username: string, password: string): Promise<void>;
  abstract verifyLogIn(): Promise<void>;
  abstract refresh(): Promise<void>;
  protected token: string | null;
  public redirectUrl: string | null;
  public user: User | null;

  public constructor() {
    this.token = localStorage.getItem(tokenLocalStorageName);
    this.user = null;
    this.redirectUrl = null;
  }

  public isLoggedIn(): boolean {
    return this.token != null;
  }

  public logOut(): void {
    localStorage.removeItem(tokenLocalStorageName);
    this.token = null;
  }

  protected storeToken(token: string): void {
    localStorage.setItem(tokenLocalStorageName, token);
    this.token = token;
  }

  protected storeUser(username: string, avatar?: string): void {
    this.user = new UserInfo(username);
    if (avatar) {
      this.user.avatarUrl = avatar;
    }
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  protected handleAuthError(err: any): void {
    if (
      err.response &&
      err.response.status &&
      (err.response.status === 401 || err.response.status === 403)
    ) {
      this.logOut();
    }
    throw err;
  }
}
