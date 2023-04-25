import Axios from 'axios';
import BaseAuthProvider from './baseAuthProvider';

export default class JWTAuthProvider extends BaseAuthProvider {
  public logIn(username: string, password: string): Promise<void> {
    if (this.isLoggedIn()) {
      return Promise.resolve();
    }

    return Axios.post(`${this.authUrl}/login`, {
      username,
      password,
    })
      .then((res) => {
        this.storeToken(res.data);
        this.storeUser(username);
        return;
      })
      .catch((err) => {
        this.handleAuthError(err);
      });
  }

  public verifyLogIn(): Promise<void> {
    return Axios.post(`${this.authUrl}/verify`, {
      token: this.token,
    })
      .then(() => {
        // do nothing
      })
      .catch(() => this.refresh());
  }

  public refresh(): Promise<void> {
    return Axios.post(`${this.authUrl}/refresh`, {
      token: this.token,
    })
      .then((res) => {
        this.storeToken(res.data.token);
      })
      .catch((err) => this.handleRefreshError(err));
  }
}
