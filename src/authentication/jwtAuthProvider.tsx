import Axios from 'axios';
import BaseAuthProvider from './baseAuthProvider';

export default class JWTAuthProvider extends BaseAuthProvider {
  public constructor() {
    super();
  }

  public logIn(username: string, password: string): Promise<void> {
    if (this.isLoggedIn()) {
      return Promise.resolve();
    }

    return Axios.post('/api/jwt/authenticate', {
      username,
      password,
    })
      .then(res => {
        this.storeToken(res.data.token);
        this.storeUser(username);
        return;
      })
      .catch(this.handleAuthError);
  }

  public verifyLogIn(): Promise<void> {
    return Axios.post('/api/jwt/checkToken', {
      token: this.token,
    })
      .then(() => {})
      .catch(this.handleAuthError);
  }
}
