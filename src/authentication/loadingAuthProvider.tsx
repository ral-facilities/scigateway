import { AuthProvider } from '../state/state.types';

export default class LoadingAuthProvider implements AuthProvider {
  public redirectUrl = null;
  public user = null;

  public isLoggedIn(): boolean {
    return false;
  }

  public logOut(): void {}

  public logIn(): Promise<void> {
    return Promise.reject('still loading auth provider');
  }

  public verifyLogIn(): Promise<void> {
    return Promise.reject('still loading auth provider');
  }
}
