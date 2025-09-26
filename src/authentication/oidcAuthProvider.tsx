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
        key: op.provider_id,
        displayName: op.display_name,
        type: 'redirect',
      }));
    }
  }

  public getAuthenticator(): string {
    return this.oidcProvider?.provider_id ?? '';
  }

  public async setAuthenticator(
    provider: string,
    disableSideEffects?: boolean,
    referrer?: string
  ): Promise<void> {
    const oidcProvider = this.oidcProviders.find(
      (oidc) => oidc.provider_id === provider
    );
    if (oidcProvider) {
      this.oidcProvider = oidcProvider;
      if (!disableSideEffects) {
        await this.setupOIDC(oidcProvider, referrer);
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

    const state = params.get('state');

    if (!code || !this.oidcProvider || !this.verifyOIDCStateParam(state)) {
      this.logOut();
      return Promise.resolve();
    }

    return this.oidcLogIn(code, this.oidcProvider);
  }
}
