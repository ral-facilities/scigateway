import mockAxios from 'axios';
import LDAPJWTAuthProvider from './ldapJWTAuthProvider';

describe('LDAP-JWT Auth provider', () => {
  let ldapJWTAuthProvider: LDAPJWTAuthProvider;

  beforeEach(() => {
    ldapJWTAuthProvider = new LDAPJWTAuthProvider('http://localhost:8000');
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

    await ldapJWTAuthProvider.fetchMaintenanceState();
    expect(mockAxios.get).toHaveBeenCalledWith(
      'http://localhost:8000/maintenance'
    );
  });

  it('should call api to fetch scheduled maintenance state', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          show: false,
          message: 'test',
          severity: 'error',
        },
      })
    );

    await ldapJWTAuthProvider.fetchScheduledMaintenanceState();
    expect(mockAxios.get).toHaveBeenCalledWith(
      'http://localhost:8000/scheduled_maintenance'
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

    await ldapJWTAuthProvider.fetchMaintenanceState().catch(() => {
      // catch error
    });

    expect(ldapJWTAuthProvider.isLoggedIn()).toBeFalsy();
  });

  it('should log the user out if it fails to fetch scheduled maintenance state', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.reject({
        response: {
          status: 401,
        },
      })
    );

    await ldapJWTAuthProvider.fetchScheduledMaintenanceState().catch(() => {
      // catch error
    });

    expect(ldapJWTAuthProvider.isLoggedIn()).toBeFalsy();
  });
});
