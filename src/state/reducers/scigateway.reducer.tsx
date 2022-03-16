import createReducer from './createReducer';
import { singleSpaPluginRoutes } from '../actions/loadMicroFrontends';
import {
  NotificationType,
  NotificationPayload,
  RegisterRouteType,
  RegisterRoutePayload,
  ToggleDrawerType,
  AuthSuccessType,
  AutoLoginSuccessType,
  AuthFailureType,
  ConfigureStringsType,
  ConfigureStringsPayload,
  SignOutType,
  FeatureSwitchesPayload,
  ConfigureFeatureSwitchesType,
  LoadingAuthType,
  InvalidateTokenType,
  AuthProviderPayload,
  LoadAuthProviderType,
  SiteLoadingPayload,
  SiteLoadingType,
  DismissNotificationType,
  PluginConfig,
  ConfigureAnalyticsType,
  ConfigureAnalyticsPayload,
  InitialiseAnalyticsType,
  ToggleHelpType,
  AddHelpTourStepsPayload,
  AddHelpTourStepsType,
  LoadedAuthType,
  LoadDarkModePreferenceType,
  LoadDarkModePreferencePayload,
  HomepageUrlPayload,
  CustomLogoPayload,
  RegisterHomepageUrlType,
  LoadScheduledMaintenanceStateType,
  ScheduledMaintenanceStatePayLoad,
  MaintenanceStatePayLoad,
  LoadMaintenanceStateType,
  CustomLogoType,
  LoadHighContrastModePreferencePayload,
  LoadHighContrastModePreferenceType,
  ResetAuthStateType,
  CustomNavigationDrawerLogoPayload,
  CustomNavigationDrawerLogoType,
  CustomAdminPageDefaultTabPayload,
  CustomAdminPageDefaultTabType,
  RegisterContactUsAccessibilityFormUrlType,
  ContactUsAccessibilityFormUrlPayload,
} from '../scigateway.types';
import { ScigatewayState, AuthState } from '../state.types';
import { buildPluginConfig } from '../pluginhelper';
import log from 'loglevel';
import JWTAuthProvider from '../../authentication/jwtAuthProvider';
import LoadingAuthProvider from '../../authentication/loadingAuthProvider';
import GithubAuthProvider from '../../authentication/githubAuthProvider';
import { Step } from 'react-joyride';
import ICATAuthProvider from '../../authentication/icatAuthProvider';

export const authState: AuthState = {
  failedToLogin: false,
  signedOutDueToTokenInvalidation: false,
  loading: false,
  provider: new LoadingAuthProvider(),
};

export const initialState: ScigatewayState = {
  notifications: [],
  plugins: [],
  drawerOpen: false,
  siteLoading: true,
  showHelp: false,
  helpSteps: [],
  authorisation: authState,
  features: {
    showHelpPageButton: true,
    singlePluginLogo: false,
  },
  darkMode: false,
  highContrastMode: false,
  scheduledMaintenance: {
    show: false,
    message: '',
  },
  maintenance: {
    show: false,
    message: '',
  },
};

export function handleNotification(
  state: ScigatewayState,
  payload: NotificationPayload
): ScigatewayState {
  // Do not add the notification to state if a notification
  // with the same message already exists.
  if (state.notifications.some((n) => n.message === payload.message)) {
    return state;
  }

  return {
    ...state,
    notifications: [
      ...state.notifications,
      { message: payload.message, severity: payload.severity },
    ],
  };
}

export function handleDrawerToggle(state: ScigatewayState): ScigatewayState {
  return {
    ...state,
    drawerOpen: !state.drawerOpen,
  };
}

export function handleConfigureStrings(
  state: ScigatewayState,
  payload: ConfigureStringsPayload
): ScigatewayState {
  return {
    ...state,
    res: payload.res,
  };
}

const updatePlugins = (
  existingPlugins: PluginConfig[],
  payload: RegisterRoutePayload
): PluginConfig[] => {
  if (singleSpaPluginRoutes[payload.plugin]) {
    if (!singleSpaPluginRoutes[payload.plugin].includes(payload.link))
      singleSpaPluginRoutes[payload.plugin].push(payload.link);
  } else {
    singleSpaPluginRoutes[payload.plugin] = [payload.link];
  }

  if (!existingPlugins.some((p) => p.link === payload.link)) {
    return [...existingPlugins, buildPluginConfig(payload)];
  }

  log.error(
    `Duplicate plugin route identified: ${payload.link}.
     ${payload.plugin}:'${payload.displayName}' not registered`
  );
  return existingPlugins;
};

export function handleRegisterPlugin(
  state: ScigatewayState,
  payload: RegisterRoutePayload
): ScigatewayState {
  return {
    ...state,
    plugins: updatePlugins(state.plugins, payload),
  };
}

export const handleLoadingAuth = (state: ScigatewayState): ScigatewayState => ({
  ...state,
  authorisation: {
    ...state.authorisation,
    loading: true,
  },
});

export const handleLoadedAuth = (state: ScigatewayState): ScigatewayState => ({
  ...state,
  authorisation: {
    ...state.authorisation,
    loading: false,
  },
});

export function handleSuccessfulLogin(state: ScigatewayState): ScigatewayState {
  log.debug(`Successfully logged in`);
  return {
    ...state,
    authorisation: {
      ...state.authorisation,
      failedToLogin: false,
      signedOutDueToTokenInvalidation: false,
      loading: false,
    },
  };
}

export function handleSuccessfulAutoLogin(
  state: ScigatewayState
): ScigatewayState {
  log.debug(`Successfully auto logged in`);
  return {
    ...state,
    authorisation: {
      ...state.authorisation,
      loading: false,
    },
  };
}

const resetAuth = (authorisation: AuthState): AuthState => {
  return {
    ...authorisation,
    failedToLogin: false,
    signedOutDueToTokenInvalidation: false,
    loading: false,
  };
};

export function handleUnsuccessfulLogin(
  state: ScigatewayState,
  payload: null
): ScigatewayState {
  log.debug(`Failed to log in with ${payload}`);
  state.authorisation.provider.logOut();
  return {
    ...state,
    drawerOpen: false,
    authorisation: {
      ...resetAuth(state.authorisation),
      failedToLogin: true,
    },
  };
}

export function handleSignOut(state: ScigatewayState): ScigatewayState {
  log.debug(`User is being signed out`);
  state.authorisation.provider.logOut();
  return {
    ...state,
    drawerOpen: false,
    authorisation: resetAuth(state.authorisation),
  };
}

export function handleResetAuthState(state: ScigatewayState): ScigatewayState {
  return {
    ...state,
    authorisation: {
      ...resetAuth(state.authorisation),
    },
  };
}

export function handleTokenExpiration(state: ScigatewayState): ScigatewayState {
  state.authorisation.provider.logOut();
  return {
    ...state,
    drawerOpen: false,
    authorisation: {
      ...resetAuth(state.authorisation),
      signedOutDueToTokenInvalidation: true,
    },
  };
}

export function handleConfigureFeatureSwitches(
  state: ScigatewayState,
  payload: FeatureSwitchesPayload
): ScigatewayState {
  return {
    ...state,
    features: payload.switches,
  };
}

export function handleLoadScheduledMaintenanceState(
  state: ScigatewayState,
  payload: ScheduledMaintenanceStatePayLoad
): ScigatewayState {
  return {
    ...state,
    scheduledMaintenance: payload.scheduledMaintenance,
  };
}

export function handleLoadMaintenanceState(
  state: ScigatewayState,
  payload: MaintenanceStatePayLoad
): ScigatewayState {
  return {
    ...state,
    maintenance: payload.maintenance,
  };
}

export function handleRegisterHomepageUrl(
  state: ScigatewayState,
  payload: HomepageUrlPayload
): ScigatewayState {
  return {
    ...state,
    homepageUrl: payload.homepageUrl,
  };
}

export function handleCustomLogo(
  state: ScigatewayState,
  payload: CustomLogoPayload
): ScigatewayState {
  return {
    ...state,
    logo: payload.logo,
  };
}

export function handleCustomNavigationDrawerLogo(
  state: ScigatewayState,
  payload: CustomNavigationDrawerLogoPayload
): ScigatewayState {
  return {
    ...state,
    navigationDrawerLogo: payload.navigationDrawerLogo,
  };
}

export function handleCustomAdminPageDefaultTab(
  state: ScigatewayState,
  payload: CustomAdminPageDefaultTabPayload
): ScigatewayState {
  return {
    ...state,
    adminPageDefaultTab: payload.adminPageDefaultTab,
  };
}

export function handleDismissNotification(
  state: ScigatewayState,
  payload: { index: number }
): ScigatewayState {
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
  state: ScigatewayState,
  payload: AuthProviderPayload
): ScigatewayState {
  let provider = state.authorisation.provider;
  switch (payload.authProvider.split('.')[0]) {
    case 'jwt':
      provider = new JWTAuthProvider(payload.authUrl);
      break;

    case 'github':
      provider = new GithubAuthProvider(payload.authUrl);
      break;

    case 'icat':
      provider = new ICATAuthProvider(
        payload.authProvider.split('.')[1],
        payload.authUrl
      );
      break;

    default:
      throw Error(
        `Unrecognised auth provider: ${payload.authProvider}, this is a development issue as there is no implementation registered for this provider.`
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
  state: ScigatewayState,
  payload: SiteLoadingPayload
): ScigatewayState {
  return {
    ...state,
    siteLoading: payload.loading,
  };
}

export function handleConfigureAnalytics(
  state: ScigatewayState,
  payload: ConfigureAnalyticsPayload
): ScigatewayState {
  return {
    ...state,
    analytics: {
      id: payload.id,
      initialised: false,
    },
  };
}

export function handleInitialiseAnalytics(
  state: ScigatewayState
): ScigatewayState {
  if (state.analytics) {
    return {
      ...state,
      analytics: {
        id: state.analytics.id,
        initialised: true,
      },
    };
  } else {
    log.error(
      `Attempted to initialise analytics without analytics configuration -
      configureAnalytics needs to be performed before initialising`
    );
    return state;
  }
}

export function handleToggleHelp(state: ScigatewayState): ScigatewayState {
  return {
    ...state,
    showHelp: !state.showHelp,
  };
}

const updateHelpSteps = (
  existingHelpSteps: Step[],
  newSteps: Step[]
): Step[] => {
  const newHelpSteps = [...existingHelpSteps];

  newSteps.forEach((newStep) => {
    if (
      !existingHelpSteps.some(
        (existingStep) => existingStep.target === newStep.target
      )
    ) {
      newHelpSteps.push(newStep);
    } else {
      log.error(`Duplicate help step target identified: ${newStep.target}.`);
    }
  });
  return newHelpSteps;
};

export function handleAddHelpTourSteps(
  state: ScigatewayState,
  payload: AddHelpTourStepsPayload
): ScigatewayState {
  return {
    ...state,
    helpSteps: updateHelpSteps(state.helpSteps, payload.steps),
    // helpSteps: [...state.helpSteps, ...payload.steps],
  };
}

export function handleLoadDarkModePreference(
  state: ScigatewayState,
  payload: LoadDarkModePreferencePayload
): ScigatewayState {
  return {
    ...state,
    darkMode: payload.darkMode,
  };
}

export function handleLoadHighContrastModePreference(
  state: ScigatewayState,
  payload: LoadHighContrastModePreferencePayload
): ScigatewayState {
  return {
    ...state,
    highContrastMode: payload.highContrastMode,
  };
}

export function handleRegisterContactUsAccessibilityFormUrl(
  state: ScigatewayState,
  payload: ContactUsAccessibilityFormUrlPayload
): ScigatewayState {
  return {
    ...state,
    contactUsAccessibilityFormUrl: payload.contactUsAccessibilityFormUrl,
  };
}

const ScigatewayReducer = createReducer(initialState, {
  [NotificationType]: handleNotification,
  [ToggleDrawerType]: handleDrawerToggle,
  [RegisterRouteType]: handleRegisterPlugin,
  [AuthSuccessType]: handleSuccessfulLogin,
  [AuthFailureType]: handleUnsuccessfulLogin,
  [AutoLoginSuccessType]: handleSuccessfulAutoLogin,
  [LoadingAuthType]: handleLoadingAuth,
  [LoadedAuthType]: handleLoadedAuth,
  [LoadAuthProviderType]: handleAuthProviderUpdate,
  [ConfigureStringsType]: handleConfigureStrings,
  [SignOutType]: handleSignOut,
  [ResetAuthStateType]: handleResetAuthState,
  [InvalidateTokenType]: handleTokenExpiration,
  [ConfigureFeatureSwitchesType]: handleConfigureFeatureSwitches,
  [LoadScheduledMaintenanceStateType]: handleLoadScheduledMaintenanceState,
  [LoadMaintenanceStateType]: handleLoadMaintenanceState,
  [DismissNotificationType]: handleDismissNotification,
  [SiteLoadingType]: handleSiteLoadingUpdate,
  [ConfigureAnalyticsType]: handleConfigureAnalytics,
  [InitialiseAnalyticsType]: handleInitialiseAnalytics,
  [ToggleHelpType]: handleToggleHelp,
  [AddHelpTourStepsType]: handleAddHelpTourSteps,
  [LoadDarkModePreferenceType]: handleLoadDarkModePreference,
  [LoadHighContrastModePreferenceType]: handleLoadHighContrastModePreference,
  [RegisterHomepageUrlType]: handleRegisterHomepageUrl,
  [CustomLogoType]: handleCustomLogo,
  [CustomNavigationDrawerLogoType]: handleCustomNavigationDrawerLogo,
  [CustomAdminPageDefaultTabType]: handleCustomAdminPageDefaultTab,
  [RegisterContactUsAccessibilityFormUrlType]:
    handleRegisterContactUsAccessibilityFormUrl,
});

export default ScigatewayReducer;
