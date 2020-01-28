import Axios from 'axios';
import BaseAuthProvider from './baseAuthProvider';
import ReactGA from 'react-ga';

export default class ICATAuthProvider extends BaseAuthProvider {
  public mnemonic: string;

  public constructor(mnemonic: string) {
    super();
    this.mnemonic = mnemonic || '';
  }

  public logIn(username: string, password: string): Promise<void> {
    console.log('logIn');
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
    console.log('verifyLogIn');
    return Axios.post('/verify', {
      token: this.token,
    })
      .then(() => {})
      .catch(() => this.refresh());
  }

  public refresh(): Promise<void> {
    console.log('refresh');
    return Axios.post('/refresh', {
      token: this.token,
    })
      .then(res => {
        this.token = res.data;
      })
      .catch(err => this.handleAuthError(err));
  }
}
