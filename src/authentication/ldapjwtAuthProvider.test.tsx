import mockAxios from 'axios';
import ldapJWTAuthProvider from './ldapjwtAuthProvider';

jest.mock('./parseJWT');

describe('ldapJWT auth provider', () => {
  let ldapJjwtAuthProvider: ldapJWTAuthProvider;

  beforeEach(() => {
    ldapJjwtAuthProvider = new ldapJWTAuthProvider('http://localhost:8000');
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

    await ldapJjwtAuthProvider.fetchMaintenanceState();
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

    await ldapJjwtAuthProvider.fetchMaintenanceState();
    expect(mockAxios.get).toHaveBeenCalledWith(
      'http://localhost:8000/maintenance'
    );
  });
});
