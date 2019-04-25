import qs from 'query-string';
import Axios from 'axios';
import BaseAuthProvider from './baseAuthProvider';

export default class GithubAuthProvider extends BaseAuthProvider {
  public constructor() {
    super();
    this.redirectUrl =
      'https://github.com/login/oauth/authorize?client_id=9fb0c571fd7b71e383b4';
  }

  public logIn(username: string, password: string): Promise<void> {
    if (this.isLoggedIn()) {
      return Promise.resolve();
    }

    const params = qs.parse(password);

    // remove existing credentials so they can be refreshed
    if (!params || !params.code) {
      this.logOut();
      return Promise.resolve();
    }

    return Axios.post('/api/github/authenticate', { code: params.code })
      .then(res => {
        this.storeToken(res.data.token);
        this.storeUser(res.data.username, res.data.avatar);
        return;
      })
      .catch(this.handleAuthError);
  }

  public verifyLogIn(): Promise<void> {
    return Axios.post('/api/github/checkToken', { token: this.token })
      .then(res => {
        this.storeUser(res.data.username, res.data.avatar);
      })
      .catch(this.handleAuthError);
  }
}
