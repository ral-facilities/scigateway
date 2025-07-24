import mockAxios from 'axios';
import * as log from 'loglevel';
import {
  BroadcastSignOutType,
  NotificationType,
} from '../state/scigateway.types';
import BaseAPIAuthProvider from './baseAPIAuthProvider';
import parseJwt from './parseJwt';

vi.mock('./parseJwt');
vi.mock('loglevel', () => ({
  error: vi.fn(),
}));

class TestBaseAPIAuthProvider extends BaseAPIAuthProvider {
  public constructor(authUrl?: string) {
    super(authUrl);
  }

  // just need this to satisfy the class definition
  public logIn(_username: string, _password: string): Promise<void> {
    return Promise.resolve();
  }
}

describe('Base API auth provider', () => {
  let testBaseAPIAuthProvider: TestBaseAPIAuthProvider;
  const testToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QifQ.hNQI_r8BATy1LyXPr6Zuo9X_V0kSED8ngcqQ6G-WV5w';
  const oidcProvider = {
    client_id: 'client_id',
    configuration_url: 'https://example.com/config',
    authorization_endpoint: 'https://example.com/auth',
    token_endpoint: 'https://example.com/token',
    display_name: 'Test',
  };

  beforeEach(() => {
    // this mocks both local and session storage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((name) => {
      if (name === 'scigateway:token') {
        return testToken;
      } else if (name === 'autoLogin') {
        return 'false';
      } else if (name === 'oidcClientId') {
        return oidcProvider.client_id;
      } else if (name === 'codeVerifier') {
        return 'code_verifier';
      } else {
        return null;
      }
    });

    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});

    testBaseAPIAuthProvider = new TestBaseAPIAuthProvider(
      'http://localhost:8000'
    );
    vi.mocked(parseJwt).mockImplementation(
      (token) =>
        `{"sessionId": "${token}", "username": "${token} username", "userIsAdmin": true}`
    );

    document.dispatchEvent = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should load the token when built', () => {
    expect(localStorage.getItem).toBeCalledWith('scigateway:token');
    expect(testBaseAPIAuthProvider.isLoggedIn()).toBeTruthy();
  });

  it('should clear the token & broadcast signout action when logging out', () => {
    testBaseAPIAuthProvider.logOut();

    expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
    expect(testBaseAPIAuthProvider.isLoggedIn()).toBeFalsy();
    expect(document.dispatchEvent).toHaveBeenCalled();
    expect(vi.mocked(document.dispatchEvent).mock.calls[0][0].detail).toEqual({
      type: BroadcastSignOutType,
    });
  });

  describe('userPassLogIn', () => {
    it('should call the api to authenticate', async () => {
      vi.mocked(mockAxios.post).mockImplementation(() =>
        Promise.resolve({
          data: testToken,
        })
      );

      const preProccessingMock = vi.fn();

      await testBaseAPIAuthProvider.userPassLogIn(
        {
          username: 'user',
          password: 'password',
        },
        preProccessingMock
      );

      expect(mockAxios.post).toHaveBeenCalledWith(
        'http://localhost:8000/login',
        { username: 'user', password: 'password' }
      );
      expect(preProccessingMock).toHaveBeenCalled();
      expect(localStorage.setItem).toBeCalledWith(
        'scigateway:token',
        testToken
      );

      expect(testBaseAPIAuthProvider.isLoggedIn()).toBeTruthy();
      expect(testBaseAPIAuthProvider.user).not.toBeNull();
      expect(testBaseAPIAuthProvider.user?.username).toBe(
        testToken + ' username'
      );
    });

    it('should log the user out for an invalid login attempt', async () => {
      vi.mocked(mockAxios.post).mockImplementation(() =>
        Promise.reject({
          response: {
            status: 401,
          },
        })
      );

      // ensure the token is null
      testBaseAPIAuthProvider.logOut();

      await testBaseAPIAuthProvider
        .userPassLogIn({ username: 'user', password: 'invalid' })
        .catch(() => {
          // catch error
        });

      expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
      expect(testBaseAPIAuthProvider.isLoggedIn()).toBeFalsy();
    });
  });

  describe('OIDC functions', () => {
    describe('oidcLogIn', () => {
      it('should get the token and call the api to authenticate', async () => {
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

        const preProccessingMock = vi.fn();

        await testBaseAPIAuthProvider.oidcLogIn(
          'abc123',
          oidcProvider,
          preProccessingMock
        );

        const params = new URLSearchParams();
        params.append('client_id', oidcProvider.client_id);
        params.append('grant_type', 'authorization_code');
        params.append('code', 'abc123');
        params.append('code_verifier', 'code_verifier');
        params.append('redirect_uri', `${window.location.origin}/login`);

        expect(mockAxios.post).toHaveBeenCalledWith(
          oidcProvider.token_endpoint,
          params
        );

        expect(mockAxios.post).toHaveBeenCalledWith(
          'http://localhost:8000/oidc_login',
          undefined,
          { headers: { Authorization: 'Bearer id_token' } }
        );

        expect(preProccessingMock).toHaveBeenCalled();
        expect(localStorage.setItem).toBeCalledWith(
          'scigateway:token',
          testToken
        );
        expect(sessionStorage.removeItem).toBeCalledWith('codeVerifier');
        expect(sessionStorage.removeItem).toBeCalledWith(
          'oidcConfigurationUrl'
        );
        expect(sessionStorage.removeItem).toBeCalledWith('oidcClientId');

        expect(testBaseAPIAuthProvider.isLoggedIn()).toBeTruthy();
        expect(testBaseAPIAuthProvider.user).not.toBeNull();
        expect(testBaseAPIAuthProvider.user?.username).toBe(
          testToken + ' username'
        );
      });

      it('should log the user out for an invalid login attempt', async () => {
        vi.mocked(mockAxios.post).mockImplementation(() =>
          Promise.reject({
            response: {
              status: 401,
            },
          })
        );

        const setupOIDCSpy = vi.spyOn(testBaseAPIAuthProvider, 'setupOIDC');
        await testBaseAPIAuthProvider
          .oidcLogIn('abc123', oidcProvider)
          .catch(() => {
            // catch error
          });

        expect(setupOIDCSpy).toHaveBeenCalledWith(oidcProvider);
        expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
        expect(testBaseAPIAuthProvider.isLoggedIn()).toBeFalsy();
      });
    });

    it('setupOIDC sets up session storage variables & redirect url', async () => {
      await testBaseAPIAuthProvider.setupOIDC(oidcProvider);

      expect(sessionStorage.setItem).toBeCalledWith(
        'codeVerifier',
        '000102030405060708090a0b0c0d0e0f101112131415161718191a1b'
      );
      sessionStorage.setItem(
        'oidcConfigurationUrl',
        oidcProvider.configuration_url
      );
      sessionStorage.setItem('oidcClientId', oidcProvider.client_id);

      expect(testBaseAPIAuthProvider.redirectUrl).toBe(
        `${oidcProvider.authorization_endpoint}?client_id=${oidcProvider.client_id}&redirect_uri=${window.location.origin}/login&response_type=code&code_challenge_method=S256&code_challenge=${'U__Mw0AMy75Lin8CfSDsubEMmLrjFNzsxtwyl-HdcBI'}&scope=openid`
      );
    });

    describe('initialiseOIDCProviders', () => {
      it('should call oidc_providers endpoint and configuration_urls to fully initialise OIDC providers', async () => {
        vi.mocked(mockAxios.get)
          .mockImplementationOnce(() =>
            Promise.resolve({
              data: [
                {
                  client_id: oidcProvider.client_id,
                  display_name: oidcProvider.display_name,
                  configuration_url: oidcProvider.configuration_url,
                },
              ],
            })
          )
          .mockImplementationOnce(() =>
            Promise.resolve({
              data: {
                authorization_endpoint: oidcProvider.authorization_endpoint,
                token_endpoint: oidcProvider.token_endpoint,
              },
            })
          );

        const oidcProviders =
          await testBaseAPIAuthProvider.initialiseOIDCProviders();

        expect(mockAxios.get).toHaveBeenCalledWith(
          'http://localhost:8000/oidc_providers'
        );

        expect(mockAxios.get).toHaveBeenCalledWith(
          oidcProvider.configuration_url
        );

        expect(oidcProviders).toEqual([oidcProvider]);
      });

      it('should error on invalid oidc_providers endpoint call', async () => {
        vi.mocked(mockAxios.get).mockImplementation(() =>
          Promise.reject({
            response: {
              status: 500,
            },
          })
        );

        await testBaseAPIAuthProvider.initialiseOIDCProviders();
        expect(log.error).toHaveBeenCalledWith(
          'Unable to fetch OIDC providers'
        );
        expect(document.dispatchEvent).toHaveBeenCalled();
        expect(
          vi.mocked(document.dispatchEvent).mock.calls[0][0].detail
        ).toEqual({
          type: NotificationType,
          payload: {
            message:
              'It is not possible to authenticate you at the moment. Please, try again later.',
            severity: 'error',
          },
        });
      });

      it('should error on invalid configuration_url endpoint call', async () => {
        vi.mocked(mockAxios.get)
          .mockImplementationOnce(() =>
            Promise.resolve({
              data: [
                {
                  client_id: oidcProvider.client_id,
                  display_name: oidcProvider.display_name,
                  configuration_url: oidcProvider.configuration_url,
                },
              ],
            })
          )
          .mockImplementation(() =>
            Promise.reject({
              response: {
                status: 500,
              },
            })
          );

        await testBaseAPIAuthProvider.initialiseOIDCProviders();
        expect(log.error).toHaveBeenCalledWith(
          'Unable to fetch OIDC config from OIDC configuration URL'
        );
        expect(document.dispatchEvent).toHaveBeenCalled();
        expect(
          vi.mocked(document.dispatchEvent).mock.calls[0][0].detail
        ).toEqual({
          type: NotificationType,
          payload: {
            message:
              'It is not possible to authenticate you at the moment. Please, try again later.',
            severity: 'error',
          },
        });
      });
    });
  });

  describe('Verify & refresh endpoints', () => {
    it('should call api to verify token', async () => {
      vi.mocked(mockAxios.post).mockImplementation(() => Promise.resolve());

      await testBaseAPIAuthProvider.verifyLogIn();

      expect(mockAxios.post).toBeCalledWith('http://localhost:8000/verify', {
        token: testToken,
      });
    });

    it('should call refresh if the access token has expired', async () => {
      vi.mocked(mockAxios.post).mockImplementation(() =>
        Promise.reject({
          response: {
            status: 401,
          },
        })
      );
      const refreshSpy = vi
        .spyOn(testBaseAPIAuthProvider, 'refresh')
        .mockImplementationOnce(() => Promise.resolve());

      await testBaseAPIAuthProvider.verifyLogIn();

      expect(refreshSpy).toHaveBeenCalled();
    });

    it('should update the token if the refresh method is successful', async () => {
      vi.mocked(mockAxios.post).mockImplementation(() =>
        Promise.resolve({
          data: 'new-token',
        })
      );

      await testBaseAPIAuthProvider.refresh();

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
      vi.mocked(mockAxios.post).mockImplementation(() =>
        Promise.reject({
          response: {
            status: 401,
          },
        })
      );

      await testBaseAPIAuthProvider.refresh().catch(() => {
        // catch error
      });

      expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
      expect(testBaseAPIAuthProvider.isLoggedIn()).toBeFalsy();
    });
  });

  describe('Maintenance endpoints', () => {
    it('should call api to fetch scheduled maintenance state', async () => {
      vi.mocked(mockAxios.get).mockImplementation(() =>
        Promise.resolve({
          data: {
            show: false,
            message: 'test',
          },
        })
      );

      await testBaseAPIAuthProvider.fetchScheduledMaintenanceState();
      expect(mockAxios.get).toHaveBeenCalledWith(
        'http://localhost:8000/scheduled_maintenance'
      );
    });

    it('should log the user out if it fails to fetch scheduled maintenance state', async () => {
      vi.mocked(mockAxios.get).mockImplementation(() =>
        Promise.reject({
          response: {
            status: 401,
          },
        })
      );

      await testBaseAPIAuthProvider
        .fetchScheduledMaintenanceState()
        .catch(() => {
          // catch error
        });

      expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
      expect(testBaseAPIAuthProvider.isLoggedIn()).toBeFalsy();
    });

    it('should call api to fetch maintenance state', async () => {
      vi.mocked(mockAxios.get).mockImplementation(() =>
        Promise.resolve({
          data: {
            show: false,
            message: 'test',
          },
        })
      );

      await testBaseAPIAuthProvider.fetchMaintenanceState();
      expect(mockAxios.get).toHaveBeenCalledWith(
        'http://localhost:8000/maintenance'
      );
    });

    it('should log the user out if it fails to fetch maintenance state', async () => {
      vi.mocked(mockAxios.get).mockImplementation(() =>
        Promise.reject({
          response: {
            status: 401,
          },
        })
      );

      await testBaseAPIAuthProvider.fetchMaintenanceState().catch(() => {
        // catch error
      });

      expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
      expect(testBaseAPIAuthProvider.isLoggedIn()).toBeFalsy();
    });

    it('should call api to set scheduled maintenance state', async () => {
      const scheduledMaintenanceState = { show: true, message: 'test' };
      mockAxios.put = vi.fn().mockImplementation(() =>
        Promise.resolve({
          data: 'test',
        })
      );

      await testBaseAPIAuthProvider.setScheduledMaintenanceState(
        scheduledMaintenanceState
      );

      expect(mockAxios.put).toBeCalledWith(
        'http://localhost:8000/scheduled_maintenance',
        scheduledMaintenanceState,
        {
          headers: {
            Authorization: `Bearer ${testToken}`,
          },
        }
      );
    });

    it('should log the user out if it fails to set scheduled maintenance state', async () => {
      const scheduledMaintenanceState = { show: true, message: 'test' };
      mockAxios.put = vi.fn().mockImplementation(() =>
        Promise.reject({
          response: {
            status: 401,
          },
        })
      );

      await testBaseAPIAuthProvider
        .setScheduledMaintenanceState(scheduledMaintenanceState)
        .catch(() => {
          // catch error
        });

      expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
      expect(testBaseAPIAuthProvider.isLoggedIn()).toBeFalsy();
    });

    it('should call api to set maintenance state', async () => {
      const maintenanceState = { show: true, message: 'test' };
      mockAxios.put = vi
        .fn()
        .mockImplementation(() => Promise.resolve({ data: 'test' }));

      await testBaseAPIAuthProvider.setMaintenanceState(maintenanceState);

      expect(mockAxios.put).toBeCalledWith(
        'http://localhost:8000/maintenance',
        maintenanceState,
        {
          headers: {
            Authorization: `Bearer ${testToken}`,
          },
        }
      );
    });

    it('should log the user out if it fails to set maintenance state', async () => {
      const maintenanceState = { show: true, message: 'test' };
      mockAxios.put = vi.fn().mockImplementation(() =>
        Promise.reject({
          response: {
            status: 401,
          },
        })
      );

      await testBaseAPIAuthProvider
        .setMaintenanceState(maintenanceState)
        .catch(() => {
          // catch error
        });

      expect(localStorage.removeItem).toBeCalledWith('scigateway:token');
      expect(testBaseAPIAuthProvider.isLoggedIn()).toBeFalsy();
    });
  });
});
