import { AuthProvider } from '../state/state.types';

export default class TestAuthProvider implements AuthProvider {
  private token: string | null;
  public redirectUrl = null;
  public user = null;

  public constructor(token: string | null) {
    this.token = token;
  }

  public isLoggedIn(): boolean {
    return this.token !== null;
  }

  public logOut(): void {}

  public logIn(): Promise<void> {
    return Promise.reject('test auth provider');
  }

  public verifyLogIn(): Promise<void> {
    return Promise.reject('test auth provider');
  }
}
