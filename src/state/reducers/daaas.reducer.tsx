import createReducer from './createReducer';
import {
  NotificationType,
  NotificationPayload,
  ToggleDrawerType,
} from '../daaas.types';
import { DaaasState } from '../state.types';

export const initialState: DaaasState = {
  notifications: [],
  drawerOpen: false,
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

export function handleDrawerToggle(state: DaaasState): DaaasState {
  return {
    ...state,
    drawerOpen: !state.drawerOpen,
  };
}

const DaaasReducer = createReducer(initialState, {
  [NotificationType]: handleNotification,
  [ToggleDrawerType]: handleDrawerToggle,
});

export default DaaasReducer;
