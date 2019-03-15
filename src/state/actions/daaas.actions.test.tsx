import { daaasNotification } from './daaas.actions';
import { NotificationType } from '../daaas.types';

describe('daaas actions', () => {
  it('daaasNotification should have a message', () => {
    const action = daaasNotification('test message');

    expect(action.type).toEqual(NotificationType);
    expect(action.payload.message).toEqual('test message');
  });
});
