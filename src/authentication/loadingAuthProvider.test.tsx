import LoadingAuthProvider from './loadingAuthProvider';

describe('loading auth provider', () => {
  let authProvider: LoadingAuthProvider;

  beforeEach(() => {
    authProvider = new LoadingAuthProvider();
  });

  it('always returns false for isLoggedIn', () => {
    expect(authProvider.isLoggedIn()).toBeFalsy();
  });

  it('rejects log in attempts saying the auth provider is still loading', async () => {
    let message = '';
    try {
      await authProvider.logIn();
    } catch (err) {
      message = err;
    }

    expect(message).toBe('still loading auth provider');
  });

  it('rejects verification attempts saying the auth provider is still loading', async () => {
    let message = '';
    try {
      await authProvider.verifyLogIn();
    } catch (err) {
      message = err;
    }

    expect(message).toBe('still loading auth provider');
  });

  it('rejects refresh attempts saying the auth provider is still loading', async () => {
    let message = '';
    try {
      await authProvider.refresh();
    } catch (err) {
      message = err;
    }

    expect(message).toBe('still loading auth provider');
  });
});
