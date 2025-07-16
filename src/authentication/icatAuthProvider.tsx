import axios from 'axios';
import * as log from 'loglevel';
import { NotificationType } from '../state/scigateway.types';
import { Authenticator, ICATAuthenticator } from '../state/state.types';
import BaseAPIAuthProvider, {
  InitialisedOIDCProvider,
} from './baseAPIAuthProvider';

function fetchMnemonics(authUrl?: string): Promise<ICATAuthenticator[]> {
  return axios
    .get(`${authUrl}/authenticators`)
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      log.error('Unable to fetch ICAT authenticators');
      document.dispatchEvent(
        new CustomEvent('scigateway', {
          detail: {
            type: NotificationType,
            payload: {
              message:
                'It is not possible to authenticate you at the moment. Please, try again later',
              severity: 'error',
            },
          },
        })
      );
      return [];
    });
}

export default class ICATAuthProvider extends BaseAPIAuthProvider {
  private mnemonic: string;
  // TODO: should mnemonics be the full list of mnemonics so we can check things like anon enabled for autoLogin, delegating enabled for OIDC etc?
  private mnemonics: ICATAuthenticator[];
  private oidcProviders: InitialisedOIDCProvider[];
  public authenticators: Authenticator[];
  private authInitialised: boolean;

  public constructor(mnemonic?: string, authUrl?: string, autoLogin?: boolean) {
    super(authUrl);
    this.mnemonic = mnemonic || '';
    this.mnemonics = [];
    this.oidcProviders = [];
    this.autoLogin = autoLogin ? this.autoLoginFunc.bind(this) : undefined;
    this.authInitialised = false;
    this.authenticators = [];
  }

  public async initialise(): Promise<void> {
    if (!this.authInitialised) {
      this.mnemonics = await fetchMnemonics(this.authUrl);
      this.mnemonics = this.mnemonics.filter(
        (authenticator) =>
          !authenticator.admin && authenticator.mnemonic !== 'anon'
      );

      this.oidcProviders = await this.initialiseOIDCProviders();

      this.mnemonics = [
        ...this.mnemonics,
        ...this.oidcProviders.map((oidc) => ({
          mnemonic: `oidc_${oidc.configuration_url}`,
          keys: [{ name: 'token', hide: true }],
          friendly: oidc.display_name,
        })),
      ];
      // can we get rid of mnemonics in favour of authenticators?
      this.authenticators = this.mnemonics.map((m) => ({
        key: m.mnemonic,
        displayName: m.friendly ?? m.mnemonic,
        type:
          m.keys.find((x) => x.name === 'username') &&
          m.keys.find((x) => x.name === 'password')
            ? 'userpass'
            : m.keys.find((x) => x.name === 'token')
              ? 'redirect'
              : m.keys.length === 0
                ? 'anon'
                : 'unknown',
      }));
      this.authInitialised = true;
    }
    // re-run this on init to ensure we re-setup any OIDC stuff
    if (this.mnemonics.length === 1)
      this.setAuthenticator(this.mnemonics[0].mnemonic);
    if (this.mnemonic) this.setAuthenticator(this.mnemonic);
  }

  public getAuthenticator(): string {
    return this.mnemonic;
  }

  public async setAuthenticator(
    mnemonic: string,
    disableSideEffects?: boolean
  ): Promise<void> {
    this.mnemonic = mnemonic;
    if (mnemonic.startsWith('oidc_') && !disableSideEffects) {
      const configurationUrl = mnemonic.replace('oidc_', '');
      const oidcProvider = this.oidcProviders.find(
        (op) => op.configuration_url === configurationUrl
      );
      if (oidcProvider) {
        await this.setupOIDC(oidcProvider);
      } else {
        log.error(
          `Can't find oidc provider matching the specified mnemonic: ${mnemonic}`
        );
      }
    }
    return Promise.resolve();
  }

  private autoLoginFunc = (): Promise<void> => {
    const prevMnemonic = this.mnemonic;
    this.mnemonic = 'anon';
    return this.logIn('', '')
      .then(() => localStorage.setItem('autoLogin', 'true'))
      .catch((err) => {
        localStorage.setItem('autoLogin', 'false');
        throw err;
      })
      .finally(() => {
        this.mnemonic = prevMnemonic;
      });
  };

  // this has to be defined in the constructor to know whether it should exist or not
  public autoLogin;

  public logIn(username: string, password: string): Promise<void> {
    const promisePreProcessing = () => {
      // handle ICAT specific autoLogin logic
      if (this.isLoggedIn() && localStorage.getItem('autoLogin') === 'true') {
        this.logOut();
      }
    };
    if (this.mnemonic.startsWith('oidc_')) {
      const params = new URLSearchParams(password);
      const code = params.get('code');
      if (!code) {
        this.logOut();
        return Promise.resolve();
      }
      return this.oidcLogIn(
        code,
        this.mnemonic.replace('oidc_', ''),
        promisePreProcessing
      ).then(() => {
        localStorage.setItem('autoLogin', 'false');
      });
    }

    if (this.isLoggedIn() && localStorage.getItem('autoLogin') !== 'true') {
      return Promise.resolve();
    }

    return this.userPassLogIn(
      {
        mnemonic: this.mnemonic,
        credentials: {
          username,
          password,
        },
      },
      promisePreProcessing
    ).then(() => {
      localStorage.setItem('autoLogin', 'false');
    });
  }
}
