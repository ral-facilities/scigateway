import mockAxios from 'axios';
import * as log from 'loglevel';
import { Authenticator, OIDCProvider } from '../state/state.types';
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

  const oidcProviderConfig = {
    display_name: 'Keycloak',
    configuration_url: 'https://example.com/config',
    client_id: 'client_id',
  };
  const oidcProviderEndpoints = {
    authorization_endpoint: 'https://example.com/auth',
    token_endpoint: 'https://example.com/token',
  };
  const oidcProvider = { ...oidcProviderConfig, ...oidcProviderEndpoints };

  beforeEach(() => {
    window.localStorage.__proto__.getItem = vi
      .fn()
      .mockImplementation((name) =>
        name === 'scigateway:token' ? testToken : null
      );
    window.localStorage.__proto__.removeItem = vi.fn();
    window.localStorage.__proto__.setItem = vi.fn();

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
          data: [oidcProviderConfig] satisfies OIDCProvider[],
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
        key: 'https://example.com/config',
        type: 'redirect',
      },
    ] satisfies Authenticator[]);
  });

  it('should update the authenticator when setAuthenticator is called', async () => {
    vi.mocked(mockAxios.get)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: [oidcProviderConfig] satisfies OIDCProvider[],
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: oidcProviderEndpoints,
        })
      );

    await oidcAuthProvider.initialise();

    oidcAuthProvider.setAuthenticator(oidcProvider.configuration_url);
    expect(oidcAuthProvider.getAuthenticator()).toBe(
      oidcProvider.configuration_url
    );
  });

  it('should error when setAuthenticator is called when it cannot match the loaded OIDC config', async () => {
    oidcAuthProvider.setAuthenticator(oidcProvider.configuration_url);

    expect(log.error).toHaveBeenCalledWith(
      `Can't find oidc provider matching the specified authenticator: ${
        oidcProvider.configuration_url
      }`
    );
    expect(oidcAuthProvider.getAuthenticator()).toBe('');
  });

  it('should initiate OIDC login to authenticate on login', async () => {
    vi.mocked(mockAxios.get)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: [oidcProviderConfig] satisfies OIDCProvider[],
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

    oidcAuthProvider.setAuthenticator(oidcProvider.configuration_url);

    // we test OIDC login function in baseAPIAuthProvider, so just need to verify it's being called correctly
    const oidcLoginSpy = vi.spyOn(oidcAuthProvider, 'oidcLogIn');

    await oidcAuthProvider.logIn('', '?code=123456');

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
          data: [oidcProviderConfig] satisfies OIDCProvider[],
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: oidcProviderEndpoints,
        })
      );

    await oidcAuthProvider.initialise();

    oidcAuthProvider.setAuthenticator(oidcProvider.configuration_url);

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
});
