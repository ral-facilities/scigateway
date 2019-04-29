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
  ConfigureStringsType,
  ConfigureStringsPayload,
  SignOutType,
  FeatureSwitchesPayload,
  ConfigureFeatureSwitchesType,
  LoadingAuthType,
  DismissNotificationType,
} from '../daaas.types';
import { DaaasState, AuthState } from '../state.types';
import { buildPluginConfig } from '../pluginhelper';
import log from 'loglevel';

export const authState: AuthState = {
  token: '',
  failedToLogin: false,
  loggedIn: false,
  loading: false,
};

export const initialState: DaaasState = {
  notifications: [],
  plugins: [],
  drawerOpen: false,
  authorisation: authState,
  features: {
    showContactButton: true,
  },
};

export function handleNotification(
  state: DaaasState,
  payload: NotificationPayload
): DaaasState {
  return {
    ...state,
    notifications: [
      ...state.notifications,
      { message: payload.message, severity: payload.severity },
    ],
  };
}

export function handleDrawerToggle(state: DaaasState): DaaasState {
  return {
    ...state,
    drawerOpen: !state.drawerOpen,
  };
}

export function handleConfigureStrings(
  state: DaaasState,
  payload: ConfigureStringsPayload
): DaaasState {
  return {
    ...state,
    res: payload.res,
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

export const handleLoadingAuth = (state: DaaasState): DaaasState => ({
  ...state,
  authorisation: {
    ...state.authorisation,
    loading: true,
  },
});

export function handleSuccessfulLogin(
  state: DaaasState,
  payload: AuthorisedPayload
): DaaasState {
  log.debug(`Successfully logged in with ${payload}`);
  return {
    ...state,
    authorisation: {
      ...state.authorisation,
      failedToLogin: false,
      loggedIn: true,
      token: payload.token,
      loading: false,
    },
  };
}

export function handleUnsuccessfulLogin(
  state: DaaasState,
  payload: null
): DaaasState {
  log.debug(`Failed to log in with ${payload}`);
  return {
    ...state,
    authorisation: {
      ...state.authorisation,
      failedToLogin: true,
      loggedIn: false,
      token: '',
      loading: false,
    },
  };
}

export function handleSignOut(state: DaaasState): DaaasState {
  log.debug(`User is being signed out`);
  return {
    ...state,
    drawerOpen: false,
    authorisation: {
      ...state.authorisation,
      failedToLogin: false,
      loggedIn: false,
      token: '',
    },
  };
}

export function handleConfigureFeatureSwitches(
  state: DaaasState,
  payload: FeatureSwitchesPayload
): DaaasState {
  return {
    ...state,
    features: payload.switches,
  };
}

export function handleDismissNotification(
  state: DaaasState,
  payload: { index: number }
): DaaasState {
  return {
    ...state,
    notifications: [
      ...state.notifications.filter(
        (_notification, index) => index !== payload.index
      ),
    ],
  };
}

const DaaasReducer = createReducer(initialState, {
  [NotificationType]: handleNotification,
  [ToggleDrawerType]: handleDrawerToggle,
  [RegisterRouteType]: handleRegisterPlugin,
  [AuthSuccessType]: handleSuccessfulLogin,
  [AuthFailureType]: handleUnsuccessfulLogin,
  [LoadingAuthType]: handleLoadingAuth,
  [ConfigureStringsType]: handleConfigureStrings,
  [SignOutType]: handleSignOut,
  [ConfigureFeatureSwitchesType]: handleConfigureFeatureSwitches,
  [DismissNotificationType]: handleDismissNotification,
});

export default DaaasReducer;
