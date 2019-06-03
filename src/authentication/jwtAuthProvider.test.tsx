import mockAxios from 'axios';
import JWTAuthProvider from './jwtAuthProvider';
import ReactGA from 'react-ga';

describe('jwt auth provider', () => {
  let jwtAuthProvider: JWTAuthProvider;

  beforeEach(() => {
    jest.spyOn(window.localStorage.__proto__, 'getItem');
    window.localStorage.__proto__.getItem = jest
      .fn()
      .mockImplementation(name => (name === 'daaas:token' ? 'token' : null));
    window.localStorage.__proto__.removeItem = jest.fn();
    window.localStorage.__proto__.setItem = jest.fn();

    jwtAuthProvider = new JWTAuthProvider();
    ReactGA.initialize('test id', { testMode: true, titleCase: false });
  });

  afterEach(() => {
    ReactGA.testModeAPI.resetCalls();
  });

  it('should load the token when built', () => {
    expect(localStorage.getItem).toBeCalledWith('daaas:token');
    expect(jwtAuthProvider.isLoggedIn()).toBeTruthy();
  });

  it('should clear the token when logging out', () => {
    jwtAuthProvider.logOut();

    expect(localStorage.removeItem).toBeCalledWith('daaas:token');
    expect(jwtAuthProvider.isLoggedIn()).toBeFalsy();
  });

  it('should call the api to authenticate', async () => {
    (mockAxios.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          token: 'token',
        },
      })
    );

    // ensure the token is null
    jwtAuthProvider.logOut();

    await jwtAuthProvider.logIn('user', 'password');

    expect(localStorage.setItem).toBeCalledWith('daaas:token', 'token');

    expect(jwtAuthProvider.isLoggedIn()).toBeTruthy();
    expect(jwtAuthProvider.user.username).toBe('user');

    expect(ReactGA.testModeAPI.calls[1][0]).toEqual('send');
    expect(ReactGA.testModeAPI.calls[1][1]).toEqual({
      eventAction: 'Sucessfully logged in via JWT',
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
    jwtAuthProvider.logOut();

    await jwtAuthProvider.logIn('user', 'invalid').catch(() => {});

    expect(localStorage.removeItem).toBeCalledWith('daaas:token');
    expect(jwtAuthProvider.isLoggedIn()).toBeFalsy();

    expect(ReactGA.testModeAPI.calls[1][0]).toEqual('send');
    expect(ReactGA.testModeAPI.calls[1][1]).toEqual({
      eventAction: 'Failed to log in via JWT',
      eventCategory: 'Login',
      hitType: 'event',
    });
  });

  it('should call api to verify token', async () => {
    (mockAxios.post as jest.Mock).mockImplementation(() => Promise.resolve());

    await jwtAuthProvider.verifyLogIn();

    expect(mockAxios.post).toBeCalledWith('/api/jwt/checkToken', {
      token: 'token',
    });
  });

  it('should log the user out if the token has expired', async () => {
    (mockAxios.post as jest.Mock).mockImplementation(() =>
      Promise.reject({
        response: {
          status: 401,
        },
      })
    );

    // ensure the token is null
    jwtAuthProvider.logOut();

    await jwtAuthProvider.verifyLogIn().catch(() => {});

    expect(localStorage.removeItem).toBeCalledWith('daaas:token');
    expect(jwtAuthProvider.isLoggedIn()).toBeFalsy();
  });
});
