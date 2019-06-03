import Axios from 'axios';
import BaseAuthProvider from './baseAuthProvider';
import ReactGA from 'react-ga';

export default class JWTAuthProvider extends BaseAuthProvider {
  public logIn(username: string, password: string): Promise<void> {
    if (this.isLoggedIn()) {
      return Promise.resolve();
    }

    return Axios.post('/api/jwt/authenticate', {
      username,
      password,
    })
      .then(res => {
        ReactGA.event({
          category: 'Login',
          action: 'Sucessfully logged in via JWT',
        });
        this.storeToken(res.data.token);
        this.storeUser(username);
        return;
      })
      .catch(err => {
        ReactGA.event({
          category: 'Login',
          action: 'Failed to log in via JWT',
        });
        this.handleAuthError(err);
      });
  }

  public verifyLogIn(): Promise<void> {
    return Axios.post('/api/jwt/checkToken', {
      token: this.token,
    })
      .then(() => {})
      .catch(err => this.handleAuthError(err));
  }
}
