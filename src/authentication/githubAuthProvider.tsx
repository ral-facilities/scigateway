import qs from 'query-string';
import Axios from 'axios';
import BaseAuthProvider from './baseAuthProvider';
import ReactGA from 'react-ga';

export default class GithubAuthProvider extends BaseAuthProvider {
  public constructor(authUrl: string | undefined) {
    super(authUrl);
    this.authUrl = authUrl;
    this.redirectUrl =
      'https://github.com/login/oauth/authorize?client_id=9fb0c571fd7b71e383b4';
  }

  public logIn(username: string, password: string): Promise<void> {
    const params = qs.parse(password);

    // remove existing credentials so they can be refreshed
    if (!params || !params.code) {
      this.logOut();
      return Promise.resolve();
    }

    return Axios.post(`${this.authUrl}/api/github/authenticate`, {
      code: params.code,
    })
      .then(res => {
        ReactGA.event({
          category: 'Login',
          action: 'Sucessfully logged in via Github',
        });
        this.storeToken(res.data.token);
        this.storeUser(res.data.username, res.data.avatar);
        return;
      })
      .catch(err => {
        ReactGA.event({
          category: 'Login',
          action: 'Failed to log in via Github',
        });
        this.handleAuthError(err);
      });
  }

  public verifyLogIn(): Promise<void> {
    return Axios.post(`${this.authUrl}/api/github/checkToken`, {
      token: this.token,
    })
      .then(res => {
        this.storeUser(res.data.username, res.data.avatar);
      })
      .catch(err => super.handleRefreshError(err));
  }

  public refresh(): Promise<void> {
    return Promise.reject(
      'Github authenticator does not support token refresh'
    );
  }
}
