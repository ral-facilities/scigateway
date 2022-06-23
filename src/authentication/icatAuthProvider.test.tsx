import mockAxios from 'axios';
import ICATAuthProvider from './icatAuthProvider';
import ReactGA from 'react-ga';
import parseJwt from './parseJwt';
import { BroadcastSignOutType } from '../state/scigateway.types';

jest.mock('./parseJwt');

describe('ICAT auth provider', () => {
  let icatAuthProvider: ICATAuthProvider;
  const testToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QifQ.hNQI_r8BATy1LyXPr6Zuo9X_V0kSED8ngcqQ6G-WV5w';

  beforeEach(() => {
    window.localStorage.__proto__.getItem = jest
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
    window.localStorage.__proto__.removeItem = jest.fn();
    window.localStorage.__proto__.setItem = jest.fn();

    icatAuthProvider = new ICATAuthProvider(
      'mnemonic',
      'http://localhost:8000',
      true
    );
    ReactGA.initialize('test id', { testMode: true, titleCase: false });
    (parseJwt as jest.Mock).mockImplementation(
      (token) =>
        `{"sessionId": "${token}", "username": "${token} username", "userIsAdmin": true}`
    );

    document.dispatchEvent = jest.fn();
  });

  afterEach(() => {
    ReactGA.testModeAPI.resetCalls();
  });

  it('should set the mnemonic to empty string if none is provided (after autologin)', async () => {
    icatAuthProvider = new ICATAuthProvider(
      undefined,
      'http://localhost:8000',
      true
    );
    await icatAuthProvider.autoLogin();
    expect(icatAuthProvider.mnemonic).toBe('');
  });

  it('should load the token when built', () => {
    expect(localStorage.getItem).toBeCalledWith('scigateway:token');
    expect(icatAuthProvider.isLoggedIn()).toBeTruthy();
  });

  it('should clear the token & broadcast signout action when logging out', () => {
    icatAuthProvider.logOut();

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(icatAuthProvider.isLoggedIn()).toBeFalsy();
    expect(document.dispatchEvent).toHaveBeenCalled();
    expect(
      (document.dispatchEvent as jest.Mock).mock.calls[0][0].detail
    ).toEqual({
      type: BroadcastSignOutType,
    });
  });

  it('should successfully log in if user is already logged in', () => {
    return icatAuthProvider.logIn('user', 'password');
  });

  it('should successfully log in if user is already logged in via autoLogin', async () => {
    (mockAxios.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: testToken,
      })
    );
    window.localStorage.__proto__.getItem = jest
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
    expect(
      (document.dispatchEvent as jest.Mock).mock.calls[0][0].detail
    ).toEqual({
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
    (mockAxios.post as jest.Mock).mockImplementation(() =>
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
        data: testToken,
      })
    );

    // ensure token is null
    window.localStorage.__proto__.getItem = jest.fn().mockReturnValue(null);

    icatAuthProvider = new ICATAuthProvider(
      undefined,
      'http://localhost:8000',
      true
    );
    expect(icatAuthProvider.autoLogin).toBeDefined();

    await icatAuthProvider.autoLogin();

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

    icatAuthProvider = new ICATAuthProvider(
      undefined,
      'http://localhost:8000',
      true
    );
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
      'http://localhost:8000',
      true
    );
    expect(icatAuthProvider.autoLogin()).toBeDefined();
    return expect(icatAuthProvider.autoLogin()).resolves;
  });

  it('should not define autoLogin function if autoLogin arg is false', async () => {
    icatAuthProvider = new ICATAuthProvider(
      undefined,
      'http://localhost:8000',
      false
    );
    expect(icatAuthProvider.autoLogin).toBeUndefined();
  });

  it('should call api to verify token', async () => {
    (mockAxios.post as jest.Mock).mockImplementation(() => Promise.resolve());

    await icatAuthProvider.verifyLogIn();

    expect(mockAxios.post).toBeCalledWith('http://localhost:8000/verify', {
      token: testToken,
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
        token: testToken,
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

  it('should call api to set scheduled maintenance state', async () => {
    const scheduledMaintenanceState = { show: true, message: 'test' };
    mockAxios.put = jest.fn().mockImplementation(() =>
      Promise.resolve({
        data: 'test',
      })
    );

    await icatAuthProvider.setScheduledMaintenanceState(
      scheduledMaintenanceState
    );

    expect(mockAxios.put).toBeCalledWith(
      'http://localhost:8000/scheduled_maintenance',
      {
        token: testToken,
        scheduledMaintenance: scheduledMaintenanceState,
      }
    );
  });

  it('should log the user out if it fails to set scheduled maintenance state', async () => {
    const scheduledMaintenanceState = { show: true, message: 'test' };
    mockAxios.put = jest.fn().mockImplementation(() =>
      Promise.reject({
        response: {
          status: 401,
        },
      })
    );

    await icatAuthProvider
      .setScheduledMaintenanceState(scheduledMaintenanceState)
      .catch(() => {
        // catch error
      });

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(icatAuthProvider.isLoggedIn()).toBeFalsy();
  });

  it('should call api to set maintenance state', async () => {
    const maintenanceState = { show: true, message: 'test' };
    mockAxios.put = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ data: 'test' }));

    await icatAuthProvider.setMaintenanceState(maintenanceState);

    expect(mockAxios.put).toBeCalledWith('http://localhost:8000/maintenance', {
      token: testToken,
      maintenance: maintenanceState,
    });
  });

  it('should log the user out if it fails to set maintenance state', async () => {
    const maintenanceState = { show: true, message: 'test' };
    mockAxios.put = jest.fn().mockImplementation(() =>
      Promise.reject({
        response: {
          status: 401,
        },
      })
    );

    await icatAuthProvider.setMaintenanceState(maintenanceState).catch(() => {
      // catch error
    });

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(icatAuthProvider.isLoggedIn()).toBeFalsy();
  });
});
