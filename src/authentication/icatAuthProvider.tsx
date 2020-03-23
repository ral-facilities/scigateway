import Axios from 'axios';
import BaseAuthProvider from './baseAuthProvider';
import ReactGA from 'react-ga';
import parseJwt from './parseJwt';

export default class ICATAuthProvider extends BaseAuthProvider {
  public mnemonic: string;

  public constructor(mnemonic: string | undefined) {
    super();
    this.mnemonic = mnemonic || '';
  }

  public logIn(username: string, password: string): Promise<void> {
    if (this.isLoggedIn()) {
      return Promise.resolve();
    }

    return Axios.post('/login', {
      mnemonic: this.mnemonic,
      credentials: {
        username,
        password,
      },
    })
      .then(res => {
        ReactGA.event({
          category: 'Login',
          action: 'Sucessfully logged in via JWT',
        });
        this.storeToken(res.data);
        const payload: { sessionId: string; username: string } = JSON.parse(
          parseJwt(res.data)
        );
        this.storeUser(payload.username);
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
    return Axios.post('/verify', {
      token: this.token,
    })
      .then(() => {})
      .catch(() => this.refresh());
  }

  public refresh(): Promise<void> {
    return Axios.post('/refresh', {
      token: this.token,
    })
      .then(res => {
        this.storeToken(res.data);
      })
      .catch(err => this.handleAuthError(err));
  }
}
