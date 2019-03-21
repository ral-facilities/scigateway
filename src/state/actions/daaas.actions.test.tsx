import mockAxios from 'axios';
import { daaasNotification, configureSite } from './daaas.actions';
import { NotificationType } from '../daaas.types';
import { Action } from 'redux';

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
});
