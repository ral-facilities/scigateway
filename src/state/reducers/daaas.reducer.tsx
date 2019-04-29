import createReducer from './createReducer';
import {
  NotificationType,
  NotificationPayload,
  RegisterRouteType,
  RegisterRoutePayload,
  ToggleDrawerType,
  AuthSuccessType,
  AuthFailureType,
  ConfigureStringsType,
  ConfigureStringsPayload,
  SignOutType,
  FeatureSwitchesPayload,
  ConfigureFeatureSwitchesType,
  LoadingAuthType,
  TokenExpiredType,
  AuthProviderPayload,
  LoadAuthProviderType,
} from '../daaas.types';
import { DaaasNotification, DaaasState, AuthState } from '../state.types';
import { buildPluginConfig } from '../pluginhelper';
import log from 'loglevel';
import JWTAuthProvider from '../../authentication/jwtAuthProvider';
import LoadingAuthProvider from '../../authentication/loadingAuthProvider';
import GithubAuthProvider from '../../authentication/githubAuthProvider';

export const authState: AuthState = {
  failedToLogin: false,
  signedOutDueToTokenExpiry: false,
  loading: false,
  provider: new LoadingAuthProvider(),
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

function buildNotification(payload: NotificationPayload): DaaasNotification {
  return { ...payload };
}

export function handleNotification(
  state: DaaasState,
  payload: NotificationPayload
): DaaasState {
  return {
    ...state,
    notifications: [...state.notifications, buildNotification(payload)],
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

export function handleSuccessfulLogin(state: DaaasState): DaaasState {
  log.debug(`Successfully logged in`);
  return {
    ...state,
    authorisation: {
      ...state.authorisation,
      failedToLogin: false,
      signedOutDueToTokenExpiry: false,
      loading: false,
    },
  };
}

const resetAuth = (authorisation: AuthState): AuthState => {
  authorisation.provider.logOut();
  return {
    ...authorisation,
    failedToLogin: false,
    signedOutDueToTokenExpiry: false,
    loading: false,
  };
};

export function handleUnsuccessfulLogin(
  state: DaaasState,
  payload: null
): DaaasState {
  log.debug(`Failed to log in with ${payload}`);
  return {
    ...state,
    drawerOpen: false,
    authorisation: {
      ...resetAuth(state.authorisation),
      failedToLogin: true,
    },
  };
}

export function handleSignOut(state: DaaasState): DaaasState {
  log.debug(`User is being signed out`);
  return {
    ...state,
    drawerOpen: false,
    authorisation: resetAuth(state.authorisation),
  };
}

export function handleTokenExpiration(state: DaaasState): DaaasState {
  return {
    ...state,
    drawerOpen: false,
    authorisation: {
      ...resetAuth(state.authorisation),
      signedOutDueToTokenExpiry: true,
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

export function handleAuthProviderUpdate(
  state: DaaasState,
  payload: AuthProviderPayload
): DaaasState {
  let provider = state.authorisation.provider;
  console.log(payload.authProvider);
  switch (payload.authProvider) {
    case 'jwt':
      provider = new JWTAuthProvider();
      break;

    case 'github':
      provider = new GithubAuthProvider();
      break;

    default:
      break;
  }

  return {
    ...state,
    authorisation: {
      ...resetAuth(state.authorisation),
      provider,
    },
  };
}

const DaaasReducer = createReducer(initialState, {
  [NotificationType]: handleNotification,
  [ToggleDrawerType]: handleDrawerToggle,
  [RegisterRouteType]: handleRegisterPlugin,
  [AuthSuccessType]: handleSuccessfulLogin,
  [AuthFailureType]: handleUnsuccessfulLogin,
  [LoadingAuthType]: handleLoadingAuth,
  [LoadAuthProviderType]: handleAuthProviderUpdate,
  [ConfigureStringsType]: handleConfigureStrings,
  [SignOutType]: handleSignOut,
  [TokenExpiredType]: handleTokenExpiration,
  [ConfigureFeatureSwitchesType]: handleConfigureFeatureSwitches,
});

export default DaaasReducer;
