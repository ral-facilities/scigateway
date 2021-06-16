import { AuthProvider, User } from '../state/state.types';
import UserInfo from './user';
import parseJwt from '../authentication/parseJwt';

const tokenLocalStorageName = 'scigateway:token';

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
    this.user = this.extractUserFromToken();
    this.redirectUrl = null;
    this.authUrl = authUrl;
  }

  /**
   * Extracts information about the logged in user from the token stored in localStorage
   * This includes the username and if they are an admin
   * This is called on each page refresh/change to keep the user logged in persistently
   * @returns { User | null } - a user object or null if one was not found
   */
  public extractUserFromToken(): User | null {
    if (this.token != null) {
      try {
        const tokenString = parseJwt(this.token);
        if (tokenString) {
          const tokenObject = JSON.parse(tokenString);
          const user = new UserInfo(tokenObject.username);
          user.isAdmin = tokenObject.userIsAdmin;
          return user;
        }
      } catch (TypeError) {
        // not a valid JWT, token has likely been tampered with in some way (or we are running tests)
        console.error('Invalid token: failed to authenticate');
      }
    }

    return null;
  }

  public isLoggedIn(): boolean {
    return this.token != null;
  }

  public isAdmin(): boolean {
    return this.user !== null && this.user.isAdmin;
  }

  public logOut(): void {
    localStorage.removeItem(tokenLocalStorageName);
    this.token = null;
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
  }

  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
  protected handleAuthError(err: any): void {
    throw err;
  }

  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
  protected handleRefreshError(err: any): void {
    throw err;
  }
}
