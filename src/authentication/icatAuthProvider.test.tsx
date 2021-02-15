import mockAxios from 'axios';
import ICATAuthProvider from './icatAuthProvider';
import ReactGA from 'react-ga';
import parseJwt from './parseJwt';

jest.mock('./parseJwt');

describe('ICAT auth provider', () => {
  let icatAuthProvider: ICATAuthProvider;

  beforeEach(() => {
    window.localStorage.__proto__.getItem = jest
      .fn()
      .mockImplementation((name) => {
        if (name === 'scigateway:token') {
          return 'token';
        } else if (name === 'autoLogin') {
          return 'false';
        } else {
          return null;
        }
      });
    window.localStorage.__proto__.removeItem = jest.fn();
    window.localStorage.__proto__.setItem = jest.fn();

    icatAuthProvider = new ICATAuthProvider(
      'mnemonic',
      'http://localhost:8000'
    );
    ReactGA.initialize('test id', { testMode: true, titleCase: false });
    (parseJwt as jest.Mock).mockImplementation(
      (token) => `{"sessionId": "${token}", "username": "${token} username"}`
    );
  });

  afterEach(() => {
    ReactGA.testModeAPI.resetCalls();
  });

  it('should set the mnemonic to empty string if none is provided (after autologin)', async () => {
    icatAuthProvider = new ICATAuthProvider(undefined, 'http://localhost:8000');
    await icatAuthProvider.autoLogin();
    expect(icatAuthProvider.mnemonic).toBe('');
  });

  it('should load the token when built', () => {
    expect(localStorage.getItem).toBeCalledWith('scigateway:token');
    expect(icatAuthProvider.isLoggedIn()).toBeTruthy();
  });

  it('should clear the token when logging out', () => {
    icatAuthProvider.logOut();

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(icatAuthProvider.isLoggedIn()).toBeFalsy();
  });

  it('should successfully log in if user is already logged in', () => {
    return icatAuthProvider.logIn('user', 'password');
  });

  it('should call the api to authenticate', async () => {
    (mockAxios.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: 'token',
      })
    );

    // ensure the token is null
    icatAuthProvider.logOut();

    await icatAuthProvider.logIn('user', 'password');

    expect(mockAxios.post).toHaveBeenCalledWith('http://localhost:8000/login', {
      mnemonic: 'mnemonic',
      credentials: { username: 'user', password: 'password' },
    });
    expect(localStorage.setItem).toBeCalledWith('scigateway:token', 'token');
    expect(localStorage.setItem).toBeCalledWith('autoLogin', 'false');

    expect(icatAuthProvider.isLoggedIn()).toBeTruthy();
    expect(icatAuthProvider.user.username).toBe('token username');

    expect(ReactGA.testModeAPI.calls[1][0]).toEqual('send');
    expect(ReactGA.testModeAPI.calls[1][1]).toEqual({
      eventAction: 'Successfully logged in via JWT',
      eventCategory: 'Login',
      hitType: 'event',
    });
  });

  it('should log the user out for an invalid login attempt', async () => {
    (mockAxios.post as jest.Mock).mockImplementation(() =>
      Promise.reject({
        response: {
          status: 401,
        },
      })
    );

    // ensure the token is null
    icatAuthProvider.logOut();

    await icatAuthProvider.logIn('user', 'invalid').catch(() => {
      // catch error
    });

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(icatAuthProvider.isLoggedIn()).toBeFalsy();

    expect(ReactGA.testModeAPI.calls[1][0]).toEqual('send');
    expect(ReactGA.testModeAPI.calls[1][1]).toEqual({
      eventAction: 'Failed to log in via JWT',
      eventCategory: 'Login',
      hitType: 'event',
    });
  });

  it('should attempt to autologin via anon authenticator when initialised', async () => {
    (mockAxios.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: 'token',
      })
    );

    // ensure token is null
    window.localStorage.__proto__.getItem = jest.fn().mockReturnValue(null);

    icatAuthProvider = new ICATAuthProvider(undefined, 'http://localhost:8000');
    expect(icatAuthProvider.mnemonic).toBe('anon');
    expect(icatAuthProvider.autoLogin).toBeDefined();

    await icatAuthProvider.autoLogin();

    expect(mockAxios.post).toHaveBeenCalledWith('http://localhost:8000/login', {
      mnemonic: 'anon',
      credentials: { username: '', password: '' },
    });
    expect(localStorage.setItem).toBeCalledWith('scigateway:token', 'token');
    expect(localStorage.setItem).toBeCalledWith('autoLogin', 'true');

    expect(icatAuthProvider.isLoggedIn()).toBeTruthy();
    expect(icatAuthProvider.user.username).toBe('token username');

    expect(ReactGA.testModeAPI.calls[1][0]).toEqual('send');
    expect(ReactGA.testModeAPI.calls[1][1]).toEqual({
      eventAction: 'Successfully logged in via JWT',
      eventCategory: 'Login',
      hitType: 'event',
    });

    expect(icatAuthProvider.mnemonic).toBe('');
  });

  it('should set autoLogin to false if autoLogin fails', async () => {
    (mockAxios.post as jest.Mock).mockImplementation(() =>
      Promise.reject({
        response: {
          status: 401,
        },
      })
    );

    // ensure token is null
    window.localStorage.__proto__.getItem = jest.fn().mockReturnValue(null);

    icatAuthProvider = new ICATAuthProvider(undefined, 'http://localhost:8000');
    expect(icatAuthProvider.mnemonic).toBe('anon');
    expect(icatAuthProvider.autoLogin).toBeDefined();

    await icatAuthProvider.autoLogin().catch(() => {
      // catch error
    });

    expect(mockAxios.post).toHaveBeenCalledWith('http://localhost:8000/login', {
      mnemonic: 'anon',
      credentials: { username: '', password: '' },
    });

    expect(icatAuthProvider.isLoggedIn()).toBeFalsy();
    expect(localStorage.setItem).toBeCalledWith('autoLogin', 'false');

    expect(ReactGA.testModeAPI.calls[1][0]).toEqual('send');
    expect(ReactGA.testModeAPI.calls[1][1]).toEqual({
      eventAction: 'Failed to log in via JWT',
      eventCategory: 'Login',
      hitType: 'event',
    });

    expect(icatAuthProvider.mnemonic).toBe('');
  });

  it('should set autologin to resolved promise if mnemonic is set', async () => {
    icatAuthProvider = new ICATAuthProvider(
      'mnemonic',
      'http://localhost:8000'
    );
    expect(icatAuthProvider.autoLogin()).toBeDefined();
    return expect(icatAuthProvider.autoLogin()).resolves;
  });

  it('should call api to verify token', async () => {
    (mockAxios.post as jest.Mock).mockImplementation(() => Promise.resolve());

    await icatAuthProvider.verifyLogIn();

    expect(mockAxios.post).toBeCalledWith('http://localhost:8000/verify', {
      token: 'token',
    });
  });

  it('should call refresh if the access token has expired', async () => {
    (mockAxios.post as jest.Mock).mockImplementation(() =>
      Promise.reject({
        response: {
          status: 401,
        },
      })
    );
    const refreshSpy = jest
      .spyOn(icatAuthProvider, 'refresh')
      .mockImplementationOnce(() => Promise.resolve());

    await icatAuthProvider.verifyLogIn();

    expect(refreshSpy).toHaveBeenCalled();
  });

  it('should update the token if the refresh method is successful', async () => {
    (mockAxios.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: 'new-token',
      })
    );

    await icatAuthProvider.refresh();

    expect(mockAxios.post).toHaveBeenCalledWith(
      'http://localhost:8000/refresh',
      {
        token: 'token',
      }
    );
    expect(localStorage.setItem).toBeCalledWith(
      'scigateway:token',
      'new-token'
    );
  });

  it('should log the user out if the refresh token has expired', async () => {
    (mockAxios.post as jest.Mock).mockImplementation(() =>
      Promise.reject({
        response: {
          status: 401,
        },
      })
    );

    await icatAuthProvider.refresh().catch(() => {
      // catch error
    });

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(icatAuthProvider.isLoggedIn()).toBeFalsy();
  });

  it('should call api to fetch scheduled maintenance state', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          show: false,
          message: 'test',
        },
      })
    );

    await icatAuthProvider.fetchScheduledMaintenanceState();
    expect(mockAxios.get).toHaveBeenCalledWith(
      'http://localhost:8000/scheduled_maintenance'
    );
  });

  it('should log the user out if it fails to fetch scheduled maintenance state', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.reject({
        response: {
          status: 401,
        },
      })
    );

    await icatAuthProvider.fetchScheduledMaintenanceState().catch(() => {
      // catch error
    });

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(icatAuthProvider.isLoggedIn()).toBeFalsy();
  });

  it('should call api to fetch maintenance state', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          show: false,
          message: 'test',
        },
      })
    );

    await icatAuthProvider.fetchMaintenanceState();
    expect(mockAxios.get).toHaveBeenCalledWith(
      'http://localhost:8000/maintenance'
    );
  });

  it('should log the user out if it fails to fetch maintenance state', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.reject({
        response: {
          status: 401,
        },
      })
    );

    await icatAuthProvider.fetchMaintenanceState().catch(() => {
      // catch error
    });

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(icatAuthProvider.isLoggedIn()).toBeFalsy();
  });
});
