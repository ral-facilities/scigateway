import mockAxios from 'axios';
import NullAuthProvider from './nullAuthProvider';

describe('null auth provider', () => {
  let nullAuthProvider: NullAuthProvider;

  beforeEach(() => {
    nullAuthProvider = new NullAuthProvider();
  });

  afterEach(() => {
    vi.mocked(mockAxios.post).mockClear();
  });

  it('should be always logged in, logIn() and logOut() should do nothing', () => {
    expect(nullAuthProvider.isLoggedIn()).toBeTruthy();
    nullAuthProvider.logOut();
    expect(nullAuthProvider.isLoggedIn()).toBeTruthy();
    nullAuthProvider.logIn();
    expect(nullAuthProvider.isLoggedIn()).toBeTruthy();
  });

  it('should always return false for isAdmin', () => {
    expect(nullAuthProvider.isAdmin()).toBeFalsy();
  });

  it('should always resolve when verifying login', () => {
    return nullAuthProvider.verifyLogIn();
  });

  it('should always resolve when refreshing', () => {
    return nullAuthProvider.refresh();
  });

  it('should always return undefined for authUrl, and null for redirectUrl and user ', () => {
    expect(nullAuthProvider.authUrl).toBeUndefined();
    expect(nullAuthProvider.redirectUrl).toBeNull();
    expect(nullAuthProvider.user).toBeNull();
  });
});
