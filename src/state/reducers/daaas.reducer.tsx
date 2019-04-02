import createReducer from './createReducer';
import {
  NotificationType,
  NotificationPayload,
  RegisterRouteType,
  RegisterRoutePayload,
  ToggleDrawerType,
} from '../daaas.types';
import { DaaasState } from '../state.types';

export const initialState: DaaasState = {
  notifications: [],
  plugins: [],
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

export function handleRegisterPlugin(
  state: DaaasState,
  payload: RegisterRoutePayload
): DaaasState {
  const newPlugins = state.plugins.slice();
  newPlugins.push(payload);
  return {
    ...state,
    plugins: newPlugins,
  };
}

const DaaasReducer = createReducer(initialState, {
  [NotificationType]: handleNotification,
  [ToggleDrawerType]: handleDrawerToggle,
  [RegisterRouteType]: handleRegisterPlugin,
});

export default DaaasReducer;
