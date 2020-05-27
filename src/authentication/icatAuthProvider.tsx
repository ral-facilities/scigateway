import Axios from 'axios';
import BaseAuthProvider from './baseAuthProvider';
import ReactGA from 'react-ga';
import parseJwt from './parseJwt';

export default class ICATAuthProvider extends BaseAuthProvider {
  public mnemonic: string;
  public autoLogin: () => Promise<void>;

  public constructor(mnemonic: string | undefined) {
    super();
    this.mnemonic = mnemonic || '';
    if (this.mnemonic === '') {
      this.mnemonic = 'anon';
      this.autoLogin = () =>
        this.logIn('', '')
          .then(() => localStorage.setItem('autoLogin', 'true'))
          .catch(err => {
            localStorage.setItem('autoLogin', 'false');
            throw err;
          })
          .finally(() => {
            this.mnemonic = '';
          });
    } else {
      this.autoLogin = () => Promise.resolve();
    }
  }

  public logIn(username: string, password: string): Promise<void> {
    if (this.isLoggedIn() && localStorage.getItem('autoLogin') !== 'true') {
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
          action: 'Successfully logged in via JWT',
        });
        this.storeToken(res.data);
        localStorage.setItem('autoLogin', 'false');
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
      .then(() => {
        // do nothing
      })
      .catch(() => this.refresh());
  }

  public refresh(): Promise<void> {
    return Axios.post('/refresh', {
      token: this.token,
    })
      .then(res => {
        this.storeToken(res.data);
      })
      .catch(err => {
        this.handleRefreshError(err);
      });
  }
}
