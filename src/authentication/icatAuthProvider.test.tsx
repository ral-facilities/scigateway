import mockAxios from 'axios';
import * as log from 'loglevel';
import {
  BroadcastSignOutType,
  NotificationType,
} from '../state/scigateway.types';
import {
  Authenticator,
  ICATAuthenticator,
  OIDCProvider,
} from '../state/state.types';
import ICATAuthProvider from './icatAuthProvider';
import parseJwt from './parseJwt';

vi.mock('./parseJwt');
vi.mock('loglevel', () => ({
  error: vi.fn(),
}));

describe('ICAT auth provider', () => {
  let icatAuthProvider: ICATAuthProvider;
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
      .mockImplementation((name) => {
        if (name === 'scigateway:token') {
          return testToken;
        } else if (name === 'autoLogin') {
          return 'false';
        } else {
          return null;
        }
      });
    window.localStorage.__proto__.removeItem = vi.fn();
    window.localStorage.__proto__.setItem = vi.fn();

    icatAuthProvider = new ICATAuthProvider(
      'mnemonic',
      'http://localhost:8000',
      true
    );
    vi.mocked(parseJwt).mockImplementation(
      (token) =>
        `{"sessionId": "${token}", "username": "${token} username", "userIsAdmin": true}`
    );

    document.dispatchEvent = vi.fn();
  });

  it('should set the mnemonic to empty string if none is provided (after autologin)', async () => {
    icatAuthProvider = new ICATAuthProvider(
      undefined,
      'http://localhost:8000',
      true
    );
    await icatAuthProvider.autoLogin?.();
    expect(icatAuthProvider.getAuthenticator()).toBe('');
  });

  it('should load the token when built', () => {
    expect(localStorage.getItem).toBeCalledWith('scigateway:token');
    expect(icatAuthProvider.isLoggedIn()).toBeTruthy();
  });

  it('should successfully log in if user is already logged in', () => {
    return icatAuthProvider.logIn('user', 'password');
  });

  it('should update the authenticator when setAuthenticator is called', () => {
    icatAuthProvider.setAuthenticator('test');
    expect(icatAuthProvider.getAuthenticator()).toBe('test');
  });

  it('should call fetchMnemonics and initialiseOIDCProviders when initialising', async () => {
    icatAuthProvider = new ICATAuthProvider(
      undefined,
      'http://localhost:8000',
      true
    );

    vi.mocked(mockAxios.get)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: [
            {
              mnemonic: 'simple',
              friendly: 'Userpass',
              keys: [{ name: 'username' }, { name: 'password' }],
            },
            {
              mnemonic: 'db',
              admin: true,
              keys: [{ name: 'username' }, { name: 'password' }],
            },
            {
              mnemonic: 'delegating',
              friendly: 'OIDC',
              admin: true,
              keys: [{ name: 'token' }],
            },
            {
              mnemonic: 'anon',
              keys: [],
            },
            {
              mnemonic: 'anon2',
              keys: [],
            },
            {
              mnemonic: 'unknown',
              keys: [{ name: 'unknown key' }],
            },
          ] satisfies ICATAuthenticator[],
        })
      )
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
      icatAuthProvider,
      'initialiseOIDCProviders'
    );

    await icatAuthProvider.initialise();
    expect(initialiseOIDCProvidersSpy).toHaveBeenCalled();

    expect(icatAuthProvider.authenticators).toEqual([
      // note that we filter out both the admin authenticators and the "anon" authenticator
      { displayName: 'Userpass', key: 'simple', type: 'userpass' },
      { displayName: 'anon2', key: 'anon2', type: 'anon' },
      { displayName: 'unknown', key: 'unknown', type: 'unknown' },
      {
        displayName: 'Keycloak',
        key: 'https://example.com/config',
        type: 'redirect',
      },
    ] satisfies Authenticator[]);
  });

  it('should handle error properly when calling fetchMnemonics', async () => {
    icatAuthProvider = new ICATAuthProvider(
      undefined,
      'http://localhost:8000',
      true
    );

    vi.mocked(mockAxios.get).mockImplementation(() =>
      Promise.reject({
        response: {
          status: 500,
        },
      })
    );

    await icatAuthProvider.initialise();

    expect(log.error).toHaveBeenCalledWith(
      'Unable to fetch ICAT authenticators'
    );
    expect(document.dispatchEvent).toHaveBeenCalled();
    expect(vi.mocked(document.dispatchEvent).mock.calls[0][0].detail).toEqual({
      type: NotificationType,
      payload: {
        message:
          'It is not possible to authenticate you at the moment. Please, try again later.',
        severity: 'error',
      },
    });
  });

  it('should initiate OIDC login to authenticate when OIDC authenticator is selected', async () => {
    icatAuthProvider = new ICATAuthProvider(
      undefined,
      'http://localhost:8000',
      true
    );

    vi.mocked(mockAxios.get)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: [
            {
              mnemonic: 'delegating',
              friendly: 'OIDC',
              admin: true,
              keys: [{ name: 'token' }],
            },
          ] satisfies ICATAuthenticator[],
        })
      )
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

    await icatAuthProvider.initialise();

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

    // test when autologged in to ensure we log out of autoLogin
    window.localStorage.__proto__.getItem = vi
      .fn()
      .mockImplementation((name) => {
        if (name === 'scigateway:token') {
          return testToken;
        } else if (name === 'autoLogin') {
          return 'true';
        } else {
          return null;
        }
      });

    icatAuthProvider.setAuthenticator(oidcProvider.configuration_url);

    // we test OIDC login function in baseAPIAuthProvider, so just need to verify it's being called correctly
    const oidcLoginSpy = vi.spyOn(icatAuthProvider, 'oidcLogIn');

    await icatAuthProvider.logIn('', '?code=123456');

    // should send sign out action for autologin logout
    expect(document.dispatchEvent).toHaveBeenCalled();
    expect(vi.mocked(document.dispatchEvent).mock.calls[0][0].detail).toEqual({
      type: BroadcastSignOutType,
    });

    expect(oidcLoginSpy).toHaveBeenCalledWith(
      '123456',
      oidcProvider,
      expect.any(Function)
    );

    expect(localStorage.setItem).toBeCalledWith('scigateway:token', testToken);
    expect(localStorage.setItem).toBeCalledWith('autoLogin', 'false');

    expect(icatAuthProvider.isLoggedIn()).toBeTruthy();
    expect(icatAuthProvider.user).not.toBeNull();
    expect(icatAuthProvider.user?.username).toBe(testToken + ' username');
  });

  it('should log out if no code provided on OIDC login', async () => {
    icatAuthProvider = new ICATAuthProvider(
      undefined,
      'http://localhost:8000',
      true
    );

    vi.mocked(mockAxios.get)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: [
            {
              mnemonic: 'delegating',
              friendly: 'OIDC',
              admin: true,
              keys: [{ name: 'token' }],
            },
          ] satisfies ICATAuthenticator[],
        })
      )
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

    await icatAuthProvider.initialise();

    icatAuthProvider.setAuthenticator(oidcProvider.configuration_url);

    // we test OIDC login function in baseAPIAuthProvider, so just need to verify it's being called correctly
    const oidcLoginSpy = vi.spyOn(icatAuthProvider, 'oidcLogIn');

    await icatAuthProvider.logIn('', '?not_code=123456');

    expect(oidcLoginSpy).not.toHaveBeenCalled();

    expect(icatAuthProvider.isLoggedIn()).toBeFalsy();
  });

  it('should successfully log in if user is already logged in via autoLogin', async () => {
    vi.mocked(mockAxios.post).mockImplementation(() =>
      Promise.resolve({
        data: testToken,
      })
    );
    window.localStorage.__proto__.getItem = vi
      .fn()
      .mockImplementation((name) => {
        if (name === 'scigateway:token') {
          return testToken;
        } else if (name === 'autoLogin') {
          return 'true';
        } else {
          return null;
        }
      });

    await icatAuthProvider.logIn('user', 'password');

    // should send sign out action for autologin logout
    expect(document.dispatchEvent).toHaveBeenCalled();
    expect(vi.mocked(document.dispatchEvent).mock.calls[0][0].detail).toEqual({
      type: BroadcastSignOutType,
    });

    expect(mockAxios.post).toHaveBeenCalledWith('http://localhost:8000/login', {
      mnemonic: 'mnemonic',
      credentials: { username: 'user', password: 'password' },
    });
    expect(localStorage.setItem).toBeCalledWith('scigateway:token', testToken);
    expect(localStorage.setItem).toBeCalledWith('autoLogin', 'false');

    expect(icatAuthProvider.isLoggedIn()).toBeTruthy();
  });

  it('should call the api to authenticate', async () => {
    vi.mocked(mockAxios.post).mockImplementation(() =>
      Promise.resolve({
        data: testToken,
      })
    );

    // ensure the token is null
    icatAuthProvider.logOut();

    await icatAuthProvider.logIn('user', 'password');

    expect(mockAxios.post).toHaveBeenCalledWith('http://localhost:8000/login', {
      mnemonic: 'mnemonic',
      credentials: { username: 'user', password: 'password' },
    });
    expect(localStorage.setItem).toBeCalledWith('scigateway:token', testToken);
    expect(localStorage.setItem).toBeCalledWith('autoLogin', 'false');

    expect(icatAuthProvider.isLoggedIn()).toBeTruthy();
    expect(icatAuthProvider.user).not.toBeNull();
    expect(icatAuthProvider.user?.username).toBe(testToken + ' username');
  });

  it('should attempt to autologin via anon authenticator when initialised', async () => {
    vi.mocked(mockAxios.post).mockImplementation(() =>
      Promise.resolve({
        data: testToken,
      })
    );

    // ensure token is null
    window.localStorage.__proto__.getItem = vi.fn().mockReturnValue(null);

    icatAuthProvider = new ICATAuthProvider(
      undefined,
      'http://localhost:8000',
      true
    );
    expect(icatAuthProvider.autoLogin).toBeDefined();

    await icatAuthProvider.autoLogin?.();

    expect(mockAxios.post).toHaveBeenCalledWith('http://localhost:8000/login', {
      mnemonic: 'anon',
      credentials: { username: '', password: '' },
    });
    expect(localStorage.setItem).toBeCalledWith('scigateway:token', testToken);
    expect(localStorage.setItem).toBeCalledWith('autoLogin', 'true');

    expect(icatAuthProvider.isLoggedIn()).toBeTruthy();
    expect(icatAuthProvider.user).not.toBeNull();
    expect(icatAuthProvider.user?.username).toBe(testToken + ' username');
    expect(icatAuthProvider.isAdmin()).toBeTruthy();

    expect(icatAuthProvider.getAuthenticator()).toBe('');
  });

  it('should set autoLogin to false if autoLogin fails', async () => {
    vi.mocked(mockAxios.post).mockImplementation(() =>
      Promise.reject({
        response: {
          status: 401,
        },
      })
    );

    // ensure token is null
    window.localStorage.__proto__.getItem = vi.fn().mockReturnValue(null);

    icatAuthProvider = new ICATAuthProvider(
      undefined,
      'http://localhost:8000',
      true
    );
    expect(icatAuthProvider.autoLogin).toBeDefined();

    await icatAuthProvider.autoLogin?.().catch(() => {
      // catch error
    });

    expect(mockAxios.post).toHaveBeenCalledWith('http://localhost:8000/login', {
      mnemonic: 'anon',
      credentials: { username: '', password: '' },
    });

    expect(icatAuthProvider.isLoggedIn()).toBeFalsy();
    expect(localStorage.setItem).toBeCalledWith('autoLogin', 'false');

    expect(icatAuthProvider.getAuthenticator()).toBe('');
  });

  it('should set autologin to resolved promise if mnemonic is set', async () => {
    icatAuthProvider = new ICATAuthProvider(
      'mnemonic',
      'http://localhost:8000',
      true
    );
    expect(icatAuthProvider.autoLogin).toBeDefined();
    return expect(icatAuthProvider.autoLogin?.()).resolves;
  });

  it('should not define autoLogin function if autoLogin arg is false', async () => {
    icatAuthProvider = new ICATAuthProvider(
      undefined,
      'http://localhost:8000',
      false
    );
    expect(icatAuthProvider.autoLogin).toBeUndefined();
  });
});
