import createReducer from './createReducer';
import {
  NotificationType,
  NotificationPayload,
  RegisterRouteType,
  RegisterRoutePayload,
  ToggleDrawerType,
  AuthSuccessType,
  AuthFailureType,
  AuthorisedPayload,
} from '../daaas.types';
import { DaaasState, AuthState } from '../state.types';
import { buildPluginConfig } from '../pluginhelper';

export const authState: AuthState = {
  token: '',
  failedToLogin: false,
  loggedIn: false,
};

export const initialState: DaaasState = {
  notifications: [],
  plugins: [],
  drawerOpen: false,
  authorisation: authState,
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
  return {
    ...state,
    plugins: [...state.plugins, buildPluginConfig(payload)],
  };
}

export function handleSuccessfulLogin(
  state: DaaasState,
  payload: AuthorisedPayload
): DaaasState {
  console.log(`Successfully logged in with ${payload}`);
  return {
    ...state,
    authorisation: {
      ...state.authorisation,
      failedToLogin: false,
      loggedIn: true,
      token: payload.token,
    },
  };
}

export function handleUnsuccessfulLogin(
  state: DaaasState,
  payload: null
): DaaasState {
  console.log(`Failed to log in with ${payload}`);
  return {
    ...state,
    authorisation: {
      ...state.authorisation,
      failedToLogin: true,
      loggedIn: false,
      token: '',
    },
  };
}

const DaaasReducer = createReducer(initialState, {
  [NotificationType]: handleNotification,
  [ToggleDrawerType]: handleDrawerToggle,
  [RegisterRouteType]: handleRegisterPlugin,
  [AuthSuccessType]: handleSuccessfulLogin,
  [AuthFailureType]: handleUnsuccessfulLogin,
});

export default DaaasReducer;
