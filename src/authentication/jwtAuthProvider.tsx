import BaseAPIAuthProvider from './baseAPIAuthProvider';

export default class JWTAuthProvider extends BaseAPIAuthProvider {
  public constructor(authUrl: string | undefined) {
    super(authUrl);
  }

  public logIn(username: string, password: string): Promise<void> {
    if (this.isLoggedIn()) return Promise.resolve();

    return this.userPassLogIn({ username, password });
  }
}
