import { AuthProvider } from '../state/state.types';

export default class NullAuthProvider implements AuthProvider {
  public redirectUrl: string | null;
  public user = null;
  public authUrl: string | undefined;

  public constructor() {
    this.redirectUrl = null;
  }

  public isLoggedIn(): boolean {
    return true;
  }

  public isAdmin(): boolean {
    return false;
  }

  public logOut(): void {
    // Do nothing
  }

  public logIn(): Promise<void> {
    return Promise.resolve();
  }

  public verifyLogIn(): Promise<void> {
    return this.refresh();
  }

  public refresh(): Promise<void> {
    return Promise.resolve();
  }
}
