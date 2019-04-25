import mockAxios from 'axios';
import { Action } from 'redux';
import {
  daaasNotification,
  toggleDrawer,
  verifyUsernameAndPassword,
  loadingAuthentication,
  authorised,
  loadFeatureSwitches,
  configureSite,
} from './daaas.actions';
import {
  NotificationType,
  ToggleDrawerType,
  ConfigureFeatureSwitchesType,
} from '../daaas.types';
import { initialState } from '../reducers/daaas.reducer';

jest.useFakeTimers();

function mockAxiosGetResponse(message: string): void {
  (mockAxios.get as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({
      data: {
        title: message,
      },
    })
  );
}

describe('daaas actions', () => {
  beforeEach(() => {
    (mockAxios.get as jest.Mock).mockReset();

    (mockAxios.post as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          token: 'token123',
        },
      })
    );
  });

  it('daaasNotification should have a message', () => {
    const action = daaasNotification('test message');

    expect(action.type).toEqual(NotificationType);
    expect(action.payload.message).toEqual('test message');
  });

  it('toggleDrawer only needs a type', () => {
    const action = toggleDrawer();
    expect(action.type).toEqual(ToggleDrawerType);
  });

  it('given valid credentials verifyUsernameAndPassword should return with a valid token and successful authorisation', async () => {
    mockAxiosGetResponse(
      'this will be replaced by an API call to get access token'
    );

    const asyncAction = verifyUsernameAndPassword('username', 'password');
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const getState = (): any => ({
      daaas: initialState,
      router: {
        location: {
          state: {
            referrer: '/destination/after/login',
          },
        },
      },
    });

    const action = asyncAction(dispatch, getState);
    jest.runAllTimers();
    await action;

    expect(actions[0]).toEqual(loadingAuthentication());
    expect(actions[1]).toEqual(authorised('validLoginToken'));
    expect(actions[2]).toEqual({
      type: '@@router/CALL_HISTORY_METHOD',
      payload: {
        args: ['/destination/after/login'],
        method: 'push',
      },
    });
  });

  it('given invalid credentials verifyUsernameAndPassword should return an authorisation failure', async () => {
    mockAxiosGetResponse(
      'this will be replaced by an API call to get access token'
    );

    const asyncAction = verifyUsernameAndPassword('INVALID_NAME', 'password');
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);

    const action = asyncAction(dispatch);
    jest.runAllTimers();
    await action;
    const expectedResponse = { type: 'daaas:auth_failure' };

    expect(actions[0]).toEqual(loadingAuthentication());
    expect(actions[1]).toEqual(expectedResponse);
  });

  it('given feature settings loadFeatureSwitches updates state to show feature', () => {
    const features = { showContactButton: true };

    const action = loadFeatureSwitches(features);
    expect(action.type).toEqual(ConfigureFeatureSwitchesType);
    expect(action.payload.switches).toEqual({ showContactButton: true });
  });

  it('given a feature switch loadFeatureSwitches is run', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          features: { showContactButton: true },
          'ui-strings': '/res/default.json',
        },
      })
    );

    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);

    await asyncAction(dispatch);

    expect(actions[0]).toEqual(
      loadFeatureSwitches({ showContactButton: true })
    );
  });
});
