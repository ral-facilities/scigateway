import createReducer from './createReducer';
import { NotificationType, NotificationPayload } from '../daaas.types';
import { DaaasState } from '../state.types';

const initialState: DaaasState = {
  notifications: [],
};

export function handleNotification(
  state: DaaasState,
  payload: NotificationPayload
): DaaasState {
  return {
    ...state,
    notifications: [payload.message],
  };
}

const DaaasReducer = createReducer(initialState, {
  [NotificationType]: handleNotification,
});

export default DaaasReducer;
