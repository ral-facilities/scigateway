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
  SiteLoadingPayload,
  SiteLoadingType,
  DismissNotificationType,
} from '../daaas.types';
import { DaaasState, AuthState } from '../state.types';
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
  siteLoading: true,
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

export function handleAuthProviderUpdate(
  state: DaaasState,
  payload: AuthProviderPayload
): DaaasState {
  let provider = state.authorisation.provider;
  switch (payload.authProvider) {
    case 'jwt':
      provider = new JWTAuthProvider();
      break;

    case 'github':
      provider = new GithubAuthProvider();
      break;

    default:
      throw Error(
        `Unrecognised auth provider: ${
          payload.authProvider
        }, this is a development issue as there is no implementation registered for this provider.`
      );
  }

  return {
    ...state,
    authorisation: {
      ...resetAuth(state.authorisation),
      provider,
    },
  };
}

export function handleSiteLoadingUpdate(
  state: DaaasState,
  payload: SiteLoadingPayload
): DaaasState {
  return {
    ...state,
    siteLoading: payload.loading,
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
  [DismissNotificationType]: handleDismissNotification,
  [SiteLoadingType]: handleSiteLoadingUpdate,
});

export default DaaasReducer;
