import Axios from 'axios';
import BaseAuthProvider from './baseAuthProvider';
import ReactGA from 'react-ga';
import axios from 'axios';
import { ICATAuthenticator } from '../state/state.types';

export default class ICATAuthProvider extends BaseAuthProvider {
  public mnemonic: string;

  public constructor(mnemonic: string) {
    super();
    this.mnemonic = mnemonic;
  }

  public fetchMnemonics(): Promise<ICATAuthenticator[]> {
    return axios
      .get('/authenticators')
      .then(res => {
        return res.data;
      })
      .catch(err => {
        ReactGA.event({
          category: 'Login',
          action: 'Failed to fetch ICAT authenticator mnemonics',
        });
        return [];
      });
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
