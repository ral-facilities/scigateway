import * as log from 'loglevel';
import { Authenticator } from '../state/state.types';
import BaseAPIAuthProvider, {
  InitialisedOIDCProvider,
} from './baseAPIAuthProvider';

export default class OIDCAuthProvider extends BaseAPIAuthProvider {
  public oidcProviders: InitialisedOIDCProvider[];
  private oidcProvider: InitialisedOIDCProvider | null;
  private authInitialised: boolean;
  public authenticators: Authenticator[];

  public constructor(authUrl?: string) {
    super(authUrl);
    this.oidcProviders = [];
    this.oidcProvider = null;
    this.redirectUrl = 'unknown'; // gets filled in later
    this.authInitialised = false;
    this.authenticators = [];
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
    }
  }

  public getAuthenticator(): string {
    return this.oidcProvider?.configuration_url ?? '';
  }

  public async setAuthenticator(
    provider: string,
    disableSideEffects?: boolean
  ): Promise<void> {
    const oidcProvider = this.oidcProviders.find(
      (oidc) => oidc.configuration_url === provider
    );
    if (oidcProvider) {
      this.oidcProvider = oidcProvider;
      if (!disableSideEffects) {
        await this.setupOIDC(oidcProvider);
      }
    } else {
      log.error(
        `Can't find oidc provider matching the specified authenticator: ${provider}`
      );
    }
    return Promise.resolve();
  }

  public logIn(_username: string, password: string): Promise<void> {
    const params = new URLSearchParams(password);
    const code = params.get('code');

    if (!code || !this.oidcProvider) {
      this.logOut();
      return Promise.resolve();
    }

    return this.oidcLogIn(code, this.oidcProvider);
  }
}
