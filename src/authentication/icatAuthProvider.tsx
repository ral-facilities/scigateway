import Axios from 'axios';
import BaseAuthProvider from './baseAuthProvider';
import ReactGA from 'react-ga';
import parseJwt from './parseJwt';
import { ScheduledMaintenanceState } from '../state/scigateway.types';
import { UserManager } from 'oidc-client';
import qs from 'query-string';

export default class ICATAuthProvider extends BaseAuthProvider {
  public mnemonic: string;
  public autoLogin: () => Promise<void>;

  public constructor(
    mnemonic: string | undefined,
    authUrl: string | undefined
  ) {
    super(authUrl);
    this.mnemonic = mnemonic || '';
    this.redirectUrl = 'https://demo.identityserver.io/';
    if (this.mnemonic === '') {
      this.mnemonic = 'anon';
      this.autoLogin = () =>
        this.logIn('', '')
          .then(() => localStorage.setItem('autoLogin', 'true'))
          .catch((err) => {
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
    const params = qs.parse(password);
    /* eslint-disable  @typescript-eslint/camelcase */
    const userManager = new UserManager({
      authority: this.redirectUrl ? this.redirectUrl : undefined,
      // client_id:
      //   '47327328702-kjucdaikjpdfveuintbhnunt8qcosvhr.apps.googleusercontent.com',
      client_id: 'interactive.public',
      // redirect_uri: `${window.location.protocol}//${window.location.hostname}${
      //   window.location.port ? `:${window.location.port}` : ''
      // }/callback`,
      response_type: 'code',
      redirect_uri: 'http://localhost:3000/login',
    });
    /* eslint-enable  @typescript-eslint/camelcase */

    if (params && params.code) {
      console.log(params);
      return userManager
        .signinRedirectCallback()
        .then((user) => {
          console.log('signed in', user);
          return Axios.post(`${this.authUrl}/login`, {
            mnemonic: 'oidc',
            credentials: {
              token: user.id_token,
            },
          })
            .then((res) => {
              ReactGA.event({
                category: 'Login',
                action: 'Successfully logged in via JWT',
              });
              this.storeToken(res.data);
              localStorage.setItem('autoLogin', 'false');
              const payload: {
                sessionId: string;
                username: string;
              } = JSON.parse(parseJwt(res.data));
              this.storeUser(payload.username);
              return;
            })
            .catch((err) => {
              ReactGA.event({
                category: 'Login',
                action: 'Failed to log in via JWT',
              });
              this.handleAuthError(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    }

    if (this.mnemonic === 'oidc') {
      return userManager.signinRedirect();
    }

    return Axios.post(`${this.authUrl}/login`, {
      mnemonic: this.mnemonic,
      credentials: {
        username,
        password,
      },
    })
      .then((res) => {
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
      .catch((err) => {
        ReactGA.event({
          category: 'Login',
          action: 'Failed to log in via JWT',
        });
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
        this.storeToken(res.data);
      })
      .catch((err) => {
        this.handleRefreshError(err);
      });
  }

  public fetchScheduledMaintenanceState(): Promise<ScheduledMaintenanceState> {
    return Axios.get(`${this.authUrl}/scheduled_maintenance`)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        this.handleAuthError(err);
      });
  }
}
