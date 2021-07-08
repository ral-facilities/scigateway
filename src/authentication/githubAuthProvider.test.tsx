import mockAxios from 'axios';
import GithubAuthProvider from './githubAuthProvider';
import ReactGA from 'react-ga';

describe('github auth provider', () => {
  let authProvider: GithubAuthProvider;
  const testToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QifQ.hNQI_r8BATy1LyXPr6Zuo9X_V0kSED8ngcqQ6G-WV5w';

  beforeEach(() => {
    jest.spyOn(window.localStorage.__proto__, 'getItem');
    window.localStorage.__proto__.getItem = jest
      .fn()
      .mockImplementation((name) =>
        name === 'scigateway:token' ? testToken : null
      );
    window.localStorage.__proto__.removeItem = jest.fn();
    window.localStorage.__proto__.setItem = jest.fn();

    authProvider = new GithubAuthProvider('http://localhost:8000');
    ReactGA.initialize('test id', { testMode: true, titleCase: false });
  });

  afterEach(() => {
    ReactGA.testModeAPI.resetCalls();
  });

  it('should load the token when built', () => {
    expect(localStorage.getItem).toBeCalledWith('scigateway:token');
    expect(authProvider.isLoggedIn()).toBeTruthy();
  });

  it('should clear the token when logging out', () => {
    authProvider.logOut();

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(authProvider.isLoggedIn()).toBeFalsy();
  });

  it('should call the api to verify code', async () => {
    (mockAxios.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          token: testToken,
          username: 'user',
          avatar: 'gravitar.com/fiowmefoimwe',
        },
      })
    );

    // ensure the token is null
    authProvider.logOut();

    await authProvider.logIn('', '?code=code12345');

    expect(localStorage.setItem).toBeCalledWith('scigateway:token', testToken);

    expect(authProvider.isLoggedIn()).toBeTruthy();
    expect(authProvider.user).not.toBeNull();
    expect(authProvider.user?.username).toBe('user');
    expect(authProvider.user?.avatarUrl).toBe('gravitar.com/fiowmefoimwe');

    expect(ReactGA.testModeAPI.calls[1][0]).toEqual('send');
    expect(ReactGA.testModeAPI.calls[1][1]).toEqual({
      eventAction: 'Sucessfully logged in via Github',
      eventCategory: 'Login',
      hitType: 'event',
    });
  });

  it('should log the user out if there is no verification code', async () => {
    await authProvider.logIn('', '?notcodeparam=1234');

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(authProvider.isLoggedIn()).toBeFalsy();
  });

  it('should log the user out if code is invalid', async () => {
    (mockAxios.post as jest.Mock).mockImplementation(() =>
      Promise.reject({
        response: {
          status: 401,
        },
      })
    );

    await authProvider.logIn('', '?code=fake').catch(() => {
      // catch error
    });

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(authProvider.isLoggedIn()).toBeFalsy();

    expect(ReactGA.testModeAPI.calls[1][0]).toEqual('send');
    expect(ReactGA.testModeAPI.calls[1][1]).toEqual({
      eventAction: 'Failed to log in via Github',
      eventCategory: 'Login',
      hitType: 'event',
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

    await authProvider.verifyLogIn().catch(() => {
      //catch error
    });

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(authProvider.isLoggedIn()).toBeFalsy();
  });

  it('should return user information if token is valid', async () => {
    (mockAxios.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          username: 'test_user',
          avatar: 'test_avatar',
        },
      })
    );

    await authProvider.verifyLogIn();

    expect(authProvider.user).not.toBeNull();
    expect(authProvider.user?.username).toBe('test_user');
    expect(authProvider.user?.avatarUrl).toBe('test_avatar');
  });

  it('should return error if refresh method is called', async () => {
    let message = '';
    try {
      await authProvider.refresh();
    } catch (err) {
      message = err;
    }

    expect(message).toBe('Github authenticator does not support token refresh');
  });
});
