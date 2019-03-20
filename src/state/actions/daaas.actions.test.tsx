import { daaasNotification, toggleDrawer } from './daaas.actions';
import { NotificationType, ToggleDrawerType } from '../daaas.types';

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
});
