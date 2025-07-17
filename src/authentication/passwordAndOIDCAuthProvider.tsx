import * as log from 'loglevel';
import { Authenticator } from '../state/state.types';
import BaseAPIAuthProvider, {
  InitialisedOIDCProvider,
} from './baseAPIAuthProvider';

export default class PasswordAndOIDCAuthProvider extends BaseAPIAuthProvider {
  public oidcProviders: InitialisedOIDCProvider[];
  private authInitialised: boolean;
  public authenticators: Authenticator[];
  private authenticator: Authenticator | null;

  public constructor(authUrl?: string) {
    super(authUrl);
    this.oidcProviders = [];
    this.redirectUrl = 'unknown'; // gets filled in later
    this.authInitialised = false;
    this.authenticators = [];
    this.authenticator = null;
  }

  public async initialise(): Promise<void> {
    if (!this.authInitialised) {
      this.oidcProviders = await this.initialiseOIDCProviders();
      this.authInitialised = true;
      this.authenticators = this.oidcProviders.map((op) => ({
        key: op.configuration_url,
        displayName: op.display_name,
        type: 'redirect',
      }));
      this.authenticators.push({
        key: 'userpass',
        displayName: 'Username & Password',
        type: 'userpass',
      });
    }
  }

  public getAuthenticator(): string {
    return this.authenticator?.key || '';
  }

  public async setAuthenticator(
    authenticatorKey: string,
    disableSideEffects?: boolean
  ): Promise<void> {
    const newAuthenticator = this.authenticators.find(
      (a) => a.key === authenticatorKey
    );
    if (typeof newAuthenticator === 'undefined') {
      log.error(
        `Can't find authenticator matching the specified authenticator: ${authenticatorKey}`
      );
      return Promise.resolve();
    }
    this.authenticator = newAuthenticator;

    if (!disableSideEffects) {
      if (this.authenticator?.type === 'redirect') {
        const oidcProvider = this.oidcProviders.find(
          (oidc) => oidc.configuration_url === this.authenticator?.key
        );
        if (oidcProvider) {
          await this.setupOIDC(oidcProvider);
        } else {
          log.error(
            `Can't find oidc provider matching the specified authenticator: ${authenticatorKey}`
          );
        }
      }
    }
    return Promise.resolve();
  }

  public logIn(username: string, password: string): Promise<void> {
    if (this.authenticator?.type === 'redirect') {
      const params = new URLSearchParams(password);
      const code = params.get('code');

      const oidcProvider = this.oidcProviders.find(
        (op) => op.configuration_url === this.authenticator?.key
      );

      if (!code || !oidcProvider) {
        this.logOut();
        return Promise.resolve();
      }

      return this.oidcLogIn(code, oidcProvider);
    } else if (this.authenticator?.type === 'userpass') {
      return this.userPassLogIn({ username, password });
    }
    // should only get here if authenticator is null for some reason which should not be possible
    return Promise.reject();
  }
}
