import mockAxios from 'axios';
import { Action } from 'redux';
import {
  daaasNotification,
  configureSite,
  toggleDrawer,
  verifyUsernameAndPassword,
} from './daaas.actions';
import { NotificationType, ToggleDrawerType, LoginType } from '../daaas.types';

describe('daaas actions', () => {
  it('daaasNotification should have a message', () => {
    const action = daaasNotification('test message');

    expect(action.type).toEqual(NotificationType);
    expect(action.payload.message).toEqual('test message');
  });

  it('configureSite should dispatch a daaasNotification', async () => {
    (mockAxios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          title: 'new title',
        },
      })
    );

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

  it('verifyUsernameAndPassword should dispatch a LoginType action with username and password as payload', () => {
    const action = verifyUsernameAndPassword('username', 'password');
    expect(action.type).toEqual(LoginType);
    expect(action.payload.username).toEqual('username');
    expect(action.payload.password).toEqual('password');
  });
});
