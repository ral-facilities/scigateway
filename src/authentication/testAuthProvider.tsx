import { AuthProvider } from '../state/state.types';

export default class TestAuthProvider implements AuthProvider {
  private token: string | null;
  public redirectUrl: string | null;
  public user = null;
  public mnemonic: string | undefined;

  public constructor(token: string | null) {
    this.token = token;
    this.redirectUrl = null;
  }

  public isLoggedIn(): boolean {
    return this.token !== null;
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
}
