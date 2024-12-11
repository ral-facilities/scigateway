import OGJWTAuthProvider from './OGJWTAuthProvider';

describe('OG-JWT Auth provider', () => {
  const createOGJWTAuthProvider = (token?: string): OGJWTAuthProvider => {
    jest.spyOn(window.localStorage.__proto__, 'getItem');
    window.localStorage.__proto__.getItem = jest
      .fn()
      .mockImplementation((name) =>
        name === 'scigateway:token' ? token : null
      );
    window.localStorage.__proto__.removeItem = jest.fn();
    window.localStorage.__proto__.setItem = jest.fn();
    return new OGJWTAuthProvider('http://localhost:8000');
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('isAdmin is false when token is not in local storage', () => {
    const ogJWTAuthProvider = createOGJWTAuthProvider();
    expect(ogJWTAuthProvider.isAdmin()).toBeFalsy();
  });

  it('isAdmin is true when "/users POST" is in the authorised routes', () => {
    const tokenWithAuthorisedRoutes =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VybmFtZSI6ImJhY2tlbmQiLCJhdXRob3Jpc2VkX3JvdXRlcyI6WyIvc3VibWl0L2hkZiBQT1NUIiwiL3N1Ym1pdC9tYW5pZmVzdCBQT1NUIiwiL3JlY29yZHMve2lkX30gREVMRVRFIiwiL2V4cGVyaW1lbnRzIFBPU1QiLCIvdXNlcnMgUE9TVCIsIi91c2VycyBQQVRDSCIsIi91c2Vycy97aWRffSBERUxFVEUiXSwiZXhwIjoxNzMzMTM3NDk5fQ.jRJZr38lUeqKL1D5M6TdYIS8DEEWcZUgFfvNYcqZIqraKi9Ck2VNv3uf5XjOsD-phjjNltMmh77MxbVyUvE7ZCtCgN4vJyjA3NiF-YPiDK8miRIo9DPVEi1NBBvlMoZm_vyLcOTW0ClX4XLXuOi_1qJkMZkw0P_VtARstNnXuaiRwXiHe80IObm6GNTxFmOx5db4xTMtvYVtUOY26O68cJ4fDuOZ-xq4pvWV-oH-IigM-e-LC70eS4dGxRyx5TFHUQtwWfAvsSrrhwLf8iMXuem0oFs7qSKd0Tpc3mymVq0ZnHZQg7ctYY57lMZo57QxtCqxqDd_4A25jucf5LrchQ';
    const ogJWTAuthProvider = createOGJWTAuthProvider(
      tokenWithAuthorisedRoutes
    );
    expect(ogJWTAuthProvider.isAdmin()).toBeTruthy();
  });
  // TODO change '/users POST' to '/users GET' once that route is created
  it('isAdmin is false when "/users POST" is not in the authorised routes', () => {
    const tokenWithAuthorisedRoutes =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VybmFtZSI6ImZyb250ZW5kIiwiYXV0aG9yaXNlZF9yb3V0ZXMiOm51bGwsImV4cCI6MTczMzE0MDM2Nn0.PdzhtTPhu7skG-DJCeOMLHCruxvwoCEbgsINzHncpsVv0JkBmG0-272evQPQJVYzSwMUdjW8EpQu20RVDiQ9-cR0Ae_RYfKOiMv2_R8bLkSfyMIr9C3NOi6FONJlO79u1he15fYT85OAxH9IaOZLfSsVxW2eJBehKphOZdX2VSQqmAbe8f35chU-a7cQNGRkxmPcHsT_M563W53T-s7EnarXt5VIo0ybXL02jjhERHUgydGiWTa6sIN-u571FDyU7Br7VxvQmQ7tTADWTC0IxSLdoWX1XPt_ef0sxKRrnqByKdPI1q-5WQI0Jme0SYVS3DwesfMyyhrtkfjrm3MjBg';
    const ogJWTAuthProvider = createOGJWTAuthProvider(
      tokenWithAuthorisedRoutes
    );
    expect(ogJWTAuthProvider.isAdmin()).toBeFalsy();
  });
});
