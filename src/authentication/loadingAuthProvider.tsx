import { AuthProvider } from '../state/state.types';

// this provider is designed to be used from the start whilst the site
// settings are being loaded - it's meant to prevent access whilst
// the site works out which provider to use.
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

  public refresh(): Promise<void> {
    return Promise.reject('still loading auth provider');
  }
}
