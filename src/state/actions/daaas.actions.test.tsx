import mockAxios from 'axios';
import { Action } from 'redux';
import {
  daaasNotification,
  toggleDrawer,
  verifyUsernameAndPassword,
  loadFeatureSwitches,
  configureSite,
} from './daaas.actions';
import {
  NotificationType,
  ToggleDrawerType,
  ConfigureFeatureSwitchesType,
} from '../daaas.types';

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

    await asyncAction(dispatch);
    const response = {
      payload: { token: 'validLoginToken' },
      type: 'daaas:auth_success',
    };

    expect(actions[0]).toEqual(response);
  });

  it('given invalid credentials verifyUsernameAndPassword should return an authorisation failure', async () => {
    mockAxiosGetResponse(
      'this will be replaced by an API call to get access token'
    );

    const asyncAction = verifyUsernameAndPassword('INVALID_NAME', 'password');
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);

    await asyncAction(dispatch);
    const expectedResponse = { type: 'daaas:auth_failure' };

    expect(actions[0]).toEqual(expectedResponse);
  });

  it('given feature settings loadFeatureSwitches updates state to show feature', () => {
    const settings = {
      features: {
        showContactButton: true,
      },
    };

    const action = loadFeatureSwitches(settings['features']);
    expect(action.type).toEqual(ConfigureFeatureSwitchesType);
    expect(action.payload.switches).toEqual({ showContactButton: true });
  });

  it('given a feature switch loadFeatureSwitches is run', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          settings: {
            features: {
              'a feature switch setting': true,
            },
          },
        },
      })
    );

    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);

    await asyncAction(dispatch);
  });
});
