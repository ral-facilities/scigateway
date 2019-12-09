import mockAxios from 'axios';
import JWTAuthProvider from './jwtAuthProvider';

describe('jwt auth provider', () => {
  let jwtAuthProvider: JWTAuthProvider;

  beforeEach(() => {
    jest.spyOn(window.localStorage.__proto__, 'getItem');
    window.localStorage.__proto__.getItem = jest
      .fn()
      .mockImplementation(name =>
        name === 'scigateway:token' ? 'token' : null
      );
    window.localStorage.__proto__.removeItem = jest.fn();
    window.localStorage.__proto__.setItem = jest.fn();

    jwtAuthProvider = new JWTAuthProvider();
  });

  it('should load the token when built', () => {
    expect(localStorage.getItem).toBeCalledWith('scigateway:token');
    expect(jwtAuthProvider.isLoggedIn()).toBeTruthy();
  });

  it('should clear the token when logging out', () => {
    jwtAuthProvider.logOut();

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(jwtAuthProvider.isLoggedIn()).toBeFalsy();
  });

  it('should successfully log in if user is already logged in', () => {
    return jwtAuthProvider.logIn('user', 'password');
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

    expect(localStorage.setItem).toBeCalledWith('scigateway:token', 'token');

    expect(jwtAuthProvider.isLoggedIn()).toBeTruthy();
    expect(jwtAuthProvider.user.username).toBe('user');
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

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(jwtAuthProvider.isLoggedIn()).toBeFalsy();
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

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(jwtAuthProvider.isLoggedIn()).toBeFalsy();
  });
});
