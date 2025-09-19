import mockAxios from 'axios';
import * as log from 'loglevel';
import { Authenticator, OIDCProvider } from '../state/state.types';
import { InitialisedOIDCProvider } from './baseAPIAuthProvider';
import OIDCAuthProvider from './oidcAuthProvider';
import parseJwt from './parseJwt';

vi.mock('./parseJwt');
vi.mock('loglevel', () => ({
  error: vi.fn(),
}));

describe('OIDC auth provider', () => {
  let oidcAuthProvider: OIDCAuthProvider;
  const testToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QifQ.hNQI_r8BATy1LyXPr6Zuo9X_V0kSED8ngcqQ6G-WV5w';

  const oidcProviderId = 'provider_id';
  const oidcProviderConfig: Omit<OIDCProvider, 'provider_id'> = {
    display_name: 'Keycloak',
    configuration_url: 'https://example.com/config',
    client_id: 'client_id',
    pkce: true,
    scope: 'openid',
  };
  const oidcProviderEndpoints = {
    authorization_endpoint: 'https://example.com/auth',
    token_endpoint: 'https://example.com/token',
  };
  const oidcProvider: InitialisedOIDCProvider = {
    provider_id: oidcProviderId,
    ...oidcProviderConfig,
    ...oidcProviderEndpoints,
  };

  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((name) => {
      if (name === 'scigateway:token') {
        return testToken;
      } else if (name === 'oidcState') {
        return 'state';
      } else {
        return null;
      }
    });

    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});

    vi.mocked(parseJwt).mockImplementation(
      (token) =>
        `{"sessionId": "${token}", "username": "${token} username", "userIsAdmin": true}`
    );

    document.dispatchEvent = vi.fn();

    oidcAuthProvider = new OIDCAuthProvider('http://localhost:8000');
  });

  it('should load the token when built', () => {
    expect(localStorage.getItem).toBeCalledWith('scigateway:token');
    expect(oidcAuthProvider.isLoggedIn()).toBeTruthy();
  });

  it('should call initialiseOIDCProviders when initialising', async () => {
    vi.mocked(mockAxios.get)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            [oidcProviderId]: oidcProviderConfig,
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: oidcProviderEndpoints,
        })
      );
    const initialiseOIDCProvidersSpy = vi.spyOn(
      oidcAuthProvider,
      'initialiseOIDCProviders'
    );

    await oidcAuthProvider.initialise();
    expect(initialiseOIDCProvidersSpy).toHaveBeenCalled();

    expect(oidcAuthProvider.authenticators).toEqual([
      {
        displayName: 'Keycloak',
        key: oidcProviderId,
        type: 'redirect',
      },
    ] satisfies Authenticator[]);
  });

  it('should update the authenticator when setAuthenticator is called', async () => {
    vi.mocked(mockAxios.get)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            [oidcProviderId]: oidcProviderConfig,
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: oidcProviderEndpoints,
        })
      );

    await oidcAuthProvider.initialise();

    oidcAuthProvider.setAuthenticator(oidcProvider.provider_id);
    expect(oidcAuthProvider.getAuthenticator()).toBe(oidcProvider.provider_id);
  });

  it('should error when setAuthenticator is called when it cannot match the loaded OIDC config', async () => {
    oidcAuthProvider.setAuthenticator(oidcProvider.provider_id);

    expect(log.error).toHaveBeenCalledWith(
      `Can't find oidc provider matching the specified authenticator: ${
        oidcProvider.provider_id
      }`
    );
    expect(oidcAuthProvider.getAuthenticator()).toBe('');
  });

  it('should initiate OIDC login to authenticate on login', async () => {
    vi.mocked(mockAxios.get)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            [oidcProviderId]: oidcProviderConfig,
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: oidcProviderEndpoints,
        })
      );

    await oidcAuthProvider.initialise();

    vi.mocked(mockAxios.post)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: { id_token: 'id_token' },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: testToken,
        })
      );

    oidcAuthProvider.setAuthenticator(oidcProvider.provider_id);

    // we test OIDC login function in baseAPIAuthProvider, so just need to verify it's being called correctly
    const oidcLoginSpy = vi.spyOn(oidcAuthProvider, 'oidcLogIn');

    await oidcAuthProvider.logIn('', '?code=123456&state=state');

    expect(oidcLoginSpy).toHaveBeenCalledWith('123456', oidcProvider);

    expect(localStorage.setItem).toBeCalledWith('scigateway:token', testToken);

    expect(oidcAuthProvider.isLoggedIn()).toBeTruthy();
    expect(oidcAuthProvider.user).not.toBeNull();
    expect(oidcAuthProvider.user?.username).toBe(testToken + ' username');
  });

  it('should log out if no code provided', async () => {
    vi.mocked(mockAxios.get)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            [oidcProviderId]: oidcProviderConfig,
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: oidcProviderEndpoints,
        })
      );

    await oidcAuthProvider.initialise();

    oidcAuthProvider.setAuthenticator(oidcProvider.provider_id);

    // we test OIDC login function in baseAPIAuthProvider, so just need to verify it's being called correctly
    const oidcLoginSpy = vi.spyOn(oidcAuthProvider, 'oidcLogIn');

    await oidcAuthProvider.logIn('', '?not_code=123456');

    expect(oidcLoginSpy).not.toHaveBeenCalled();

    expect(oidcAuthProvider.isLoggedIn()).toBeFalsy();
  });

  it('should log out if no oidc provider has been selected', async () => {
    // we test OIDC login function in baseAPIAuthProvider, so just need to verify it's being called correctly
    const oidcLoginSpy = vi.spyOn(oidcAuthProvider, 'oidcLogIn');

    await oidcAuthProvider.logIn('', '?code=123456');

    expect(oidcLoginSpy).not.toHaveBeenCalled();

    expect(oidcAuthProvider.isLoggedIn()).toBeFalsy();
  });

  it('should log out if state validation does not pass', async () => {
    vi.mocked(mockAxios.get)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            [oidcProviderId]: oidcProviderConfig,
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: oidcProviderEndpoints,
        })
      );

    await oidcAuthProvider.initialise();

    oidcAuthProvider.setAuthenticator(oidcProvider.provider_id);

    // we test OIDC login function in baseAPIAuthProvider, so just need to verify it's being called correctly
    const oidcLoginSpy = vi.spyOn(oidcAuthProvider, 'oidcLogIn');

    await oidcAuthProvider.logIn('', '?code=123456&state=not_state');

    expect(oidcLoginSpy).not.toHaveBeenCalled();

    expect(oidcAuthProvider.isLoggedIn()).toBeFalsy();
  });
});
