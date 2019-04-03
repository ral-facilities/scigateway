import mockAxios from 'axios';
import { Action } from 'redux';
import {
  daaasNotification,
  configureSite,
  toggleDrawer,
  verifyUsernameAndPassword,
} from './daaas.actions';
import { NotificationType, ToggleDrawerType } from '../daaas.types';

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

  it('configureSite should dispatch a daaasNotification', async () => {
    mockAxiosGetResponse('new title');

    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);

    await asyncAction(dispatch);

    expect(actions[0]).toEqual(daaasNotification('{"title":"new title"}'));
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
    const response = { type: 'daaas:auth_failure' };

    expect(actions[0]).toEqual(response);
  });
});
