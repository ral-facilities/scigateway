import { AuthProvider, User } from '../state/state.types';
import UserInfo from './user';
import parseJwt from '../authentication/parseJwt';

const tokenLocalStorageName = 'scigateway:token';
const userLocalStorageName = 'scigateway: user';

export default abstract class BaseAuthProvider implements AuthProvider {
  abstract logIn(username: string, password: string): Promise<void>;
  abstract verifyLogIn(): Promise<void>;
  abstract refresh(): Promise<void>;
  protected token: string | null;
  public redirectUrl: string | null;
  public user: User | null;
  public authUrl: string | undefined;

  public constructor(authUrl: string | undefined) {
    this.token = localStorage.getItem(tokenLocalStorageName);
    this.user = this.fetchUser();
    this.redirectUrl = null;
    this.authUrl = authUrl;
  }

  public fetchUser(): User | null {
    let tokenUsername: string;
    if (this.token) {
      const tokenObject: { username: string } = JSON.parse(
        parseJwt(this.token)
      );
      tokenUsername = tokenObject.username;

      const userObject: string | null = localStorage.getItem(
        userLocalStorageName
      );
      if (userObject) {
        const parsedUserObject: User | null = JSON.parse(userObject);
        if (parsedUserObject) {
          if (parsedUserObject.username === tokenUsername) {
            return parsedUserObject;
          }
        }
      }
    }
    this.logOut();
    return null;
  }

  public isLoggedIn(): boolean {
    return this.token != null && this.user != null;
  }

  public isAdmin(): boolean {
    return this.user !== null && this.user.isAdmin;
  }

  public logOut(): void {
    localStorage.removeItem(tokenLocalStorageName);
    this.token = null;
    localStorage.removeItem(userLocalStorageName);
    this.user = null;
  }

  protected storeToken(token: string): void {
    localStorage.setItem(tokenLocalStorageName, token);
    this.token = token;
  }

  protected storeUser(
    username: string,
    isAdmin?: boolean,
    avatar?: string
  ): void {
    this.user = new UserInfo(username);

    if (typeof isAdmin !== 'undefined') {
      this.user.isAdmin = isAdmin;
    }

    if (avatar) {
      this.user.avatarUrl = avatar;
    }

    localStorage.setItem(userLocalStorageName, JSON.stringify(this.user));
  }

  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
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

  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
  protected handleRefreshError(err: any): void {
    this.logOut();
    throw err;
  }
}
