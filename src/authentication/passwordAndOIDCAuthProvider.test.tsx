import mockAxios from 'axios';
import * as log from 'loglevel';
import { Authenticator, OIDCProvider } from '../state/state.types';
import PasswordAndOIDCAuthProvider from './passwordAndOIDCAuthProvider';

vi.mock('loglevel', () => ({
  error: vi.fn(),
}));

describe('Password & OIDC auth provider', () => {
  let passwordAndOIDCAuthProvider: PasswordAndOIDCAuthProvider;
  const testToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJ1c2VySXNBZG1pbiI6ZmFsc2V9.PEuKaAD98doFTLyqcNFpsuv50AQR8ejrbDQ0pwazM7Q';

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

    document.dispatchEvent = vi.fn();

    passwordAndOIDCAuthProvider = new PasswordAndOIDCAuthProvider(
      'http://localhost:8000'
    );
  });

  it('should load the token when built', () => {
    expect(localStorage.getItem).toBeCalledWith('scigateway:token');
    expect(passwordAndOIDCAuthProvider.isLoggedIn()).toBeTruthy();
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
      passwordAndOIDCAuthProvider,
      'initialiseOIDCProviders'
    );

    await passwordAndOIDCAuthProvider.initialise();
    expect(initialiseOIDCProvidersSpy).toHaveBeenCalled();

    expect(passwordAndOIDCAuthProvider.authenticators).toEqual([
      {
        displayName: 'Keycloak',
        key: 'https://example.com/config',
        type: 'redirect',
      },
      {
        key: 'userpass',
        displayName: 'Username & Password',
        type: 'userpass',
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

    await passwordAndOIDCAuthProvider.initialise();

    passwordAndOIDCAuthProvider.setAuthenticator(
      oidcProvider.configuration_url
    );
    expect(passwordAndOIDCAuthProvider.getAuthenticator()).toBe(
      oidcProvider.configuration_url
    );
  });

  it('should error when setAuthenticator is called when it cannot find the specified authenticator', async () => {
    passwordAndOIDCAuthProvider.setAuthenticator(
      oidcProvider.configuration_url
    );

    expect(log.error).toHaveBeenCalledWith(
      `Can't find authenticator matching the specified authenticator: ${
        oidcProvider.configuration_url
      }`
    );
    expect(passwordAndOIDCAuthProvider.getAuthenticator()).toBe('');
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

    await passwordAndOIDCAuthProvider.initialise();

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

    passwordAndOIDCAuthProvider.setAuthenticator(
      oidcProvider.configuration_url
    );

    // we test OIDC login function in baseAPIAuthProvider, so just need to verify it's being called correctly
    const oidcLoginSpy = vi.spyOn(passwordAndOIDCAuthProvider, 'oidcLogIn');

    await passwordAndOIDCAuthProvider.logIn('', '?code=123456');

    expect(oidcLoginSpy).toHaveBeenCalledWith('123456', oidcProvider);

    expect(localStorage.setItem).toBeCalledWith('scigateway:token', testToken);

    expect(passwordAndOIDCAuthProvider.isLoggedIn()).toBeTruthy();
    expect(passwordAndOIDCAuthProvider.user).not.toBeNull();
    expect(passwordAndOIDCAuthProvider.user?.username).toBe('user');
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

    await passwordAndOIDCAuthProvider.initialise();

    passwordAndOIDCAuthProvider.setAuthenticator(
      oidcProvider.configuration_url
    );

    // we test OIDC login function in baseAPIAuthProvider, so just need to verify it's being called correctly
    const oidcLoginSpy = vi.spyOn(passwordAndOIDCAuthProvider, 'oidcLogIn');

    await passwordAndOIDCAuthProvider.logIn('', '?not_code=123456');

    expect(oidcLoginSpy).not.toHaveBeenCalled();

    expect(passwordAndOIDCAuthProvider.isLoggedIn()).toBeFalsy();
  });

  it('should call the api to authenticate on userpass login', async () => {
    vi.mocked(mockAxios.post).mockImplementation(() =>
      Promise.resolve({
        data: testToken,
      })
    );

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

    await passwordAndOIDCAuthProvider.initialise();

    passwordAndOIDCAuthProvider.setAuthenticator('userpass');

    // ensure the token is null
    passwordAndOIDCAuthProvider.logOut();

    await passwordAndOIDCAuthProvider.logIn('user', 'password');

    expect(localStorage.setItem).toBeCalledWith('scigateway:token', testToken);

    expect(passwordAndOIDCAuthProvider.user).not.toBeNull();
    expect(passwordAndOIDCAuthProvider.user?.username).toBe('user');
    expect(passwordAndOIDCAuthProvider.isLoggedIn()).toBeTruthy();
  });

  it('should log the user out for an invalid login attempt', async () => {
    vi.mocked(mockAxios.post).mockImplementation(() =>
      Promise.reject({
        response: {
          status: 401,
        },
      })
    );

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

    await passwordAndOIDCAuthProvider.initialise();

    passwordAndOIDCAuthProvider.setAuthenticator('userpass');

    // ensure the token is null
    passwordAndOIDCAuthProvider.logOut();

    await passwordAndOIDCAuthProvider.logIn('user', 'invalid').catch(() => {
      // catch error
    });

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(passwordAndOIDCAuthProvider.isLoggedIn()).toBeFalsy();
  });
});
