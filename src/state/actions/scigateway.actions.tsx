import { Theme } from '@material-ui/core/styles/createMuiTheme';
import axios from 'axios';
import { push } from 'connected-react-router';
import log from 'loglevel';
import { Step } from 'react-joyride';
import { Action, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
  AddHelpTourStepsPayload,
  AddHelpTourStepsType,
  ApplicationStrings,
  AuthFailureType,
  AuthProviderPayload,
  AuthSuccessType,
  ConfigureAnalyticsPayload,
  ConfigureAnalyticsType,
  ConfigureFeatureSwitchesType,
  ConfigureStringsPayload,
  ConfigureStringsType,
  DismissNotificationPayload,
  DismissNotificationType,
  FeatureSwitches,
  FeatureSwitchesPayload,
  InitialiseAnalyticsType,
  InvalidateTokenType,
  LoadAuthProviderType,
  LoadDarkModePreferencePayload,
  LoadDarkModePreferenceType,
  LoadMaintenanceStateType,
  LoadScheduledMaintenanceStateType,
  LoadedAuthType,
  LoadingAuthType,
  MaintenanceState,
  MaintenanceStatePayLoad,
  NotificationType,
  RegisterStartUrlType,
  RegisterHomepageUrlType,
  RequestPluginRerenderType,
  ScheduledMaintenanceState,
  ScheduledMaintenanceStatePayLoad,
  SendThemeOptionsPayload,
  SendThemeOptionsType,
  SignOutType,
  SiteLoadingPayload,
  SiteLoadingType,
  StartUrlPayload,
  HomepageUrlPayload,
  ToggleDrawerType,
  ToggleHelpType,
  RegisterRouteType,
  scigatewayRoutes,
} from '../scigateway.types';
import { ActionType, StateType, ThunkResult } from '../state.types';
import loadMicroFrontends from './loadMicroFrontends';

export const configureStrings = (
  appStrings: ApplicationStrings
): ActionType<ConfigureStringsPayload> => ({
  type: ConfigureStringsType,
  payload: {
    res: appStrings,
  },
});

export const loadStrings = (path: string): ThunkResult<Promise<void>> => {
  return async (dispatch) => {
    await axios
      .get(path)
      .then((res) => {
        dispatch(configureStrings(res.data));
      })
      .catch((error) =>
        log.error(`Failed to read strings from ${path}: ${error}`)
      );
  };
};

export const loadFeatureSwitches = (
  featureSwitches: FeatureSwitches
): ActionType<FeatureSwitchesPayload> => ({
  type: ConfigureFeatureSwitchesType,
  payload: {
    switches: featureSwitches,
  },
});

export const registerStartUrl = (
  startUrl: string
): ActionType<StartUrlPayload> => ({
  type: RegisterStartUrlType,
  payload: {
    startUrl: startUrl,
  },
});

export const registerHomepageUrl = (
  homepageUrl: string
): ActionType<HomepageUrlPayload> => ({
  type: RegisterHomepageUrlType,
  payload: {
    homepageUrl: homepageUrl,
  },
});

export const addHelpTourSteps = (
  steps: Step[]
): ActionType<AddHelpTourStepsPayload> => ({
  type: AddHelpTourStepsType,
  payload: {
    steps,
  },
});

export const loadAuthProvider = (
  authProvider: string,
  authUrl?: string
): ActionType<AuthProviderPayload> => ({
  type: LoadAuthProviderType,
  payload: {
    authProvider,
    authUrl,
  },
});

export const loadScheduledMaintenanceState = (
  scheduledMaintenance: ScheduledMaintenanceState
): ActionType<ScheduledMaintenanceStatePayLoad> => ({
  type: LoadScheduledMaintenanceStateType,
  payload: {
    scheduledMaintenance: scheduledMaintenance,
  },
});

export const loadMaintenanceState = (
  maintenance: MaintenanceState
): ActionType<MaintenanceStatePayLoad> => ({
  type: LoadMaintenanceStateType,
  payload: {
    maintenance: maintenance,
  },
});

export const loadingAuthentication = (): Action => ({
  type: LoadingAuthType,
});

export const loadedAuthentication = (): Action => ({
  type: LoadedAuthType,
});

export const unauthorised = (): Action => ({
  type: AuthFailureType,
});

export const authorised = (): Action => ({
  type: AuthSuccessType,
});

export const invalidToken = (): Action => ({
  type: InvalidateTokenType,
});

export const siteLoadingUpdate = (
  loading: boolean
): ActionType<SiteLoadingPayload> => ({
  type: SiteLoadingType,
  payload: {
    loading,
  },
});

export const configureAnalytics = (
  id: string
): ActionType<ConfigureAnalyticsPayload> => ({
  type: ConfigureAnalyticsType,
  payload: {
    id,
  },
});

export const initialiseAnalytics = (): Action => ({
  type: InitialiseAnalyticsType,
});

export const configureSite = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    await axios
      .get(`/settings.json`)
      .then((res) => {
        const settings = res.data;

        // invalid settings.json - Use JSON.parse to give detailed error info
        if (typeof settings !== 'object') {
          throw Error('Invalid format');
        }

        if (settings['ga-tracking-id']) {
          dispatch(configureAnalytics(settings['ga-tracking-id']));
        }

        dispatch(
          loadAuthProvider(settings['auth-provider'], settings['authUrl'])
        );

        const loadingPromises = [];

        const provider = getState().scigateway.authorisation.provider;

        if (provider.fetchMaintenanceState) {
          provider.fetchMaintenanceState().then((maintenanceState) => {
            dispatch(loadMaintenanceState(maintenanceState));
          });
        }

        // after auth provider is set then the token needs to be verified
        // also attempt to auto login if the auth provider allows it
        if (provider.isLoggedIn()) {
          const verifyingLogin = provider
            .verifyLogIn()
            .then(() => {
              dispatch(authorised());
            })
            .catch(() => {
              if (provider.autoLogin) {
                dispatch(loadingAuthentication());
                loadingPromises.push(
                  provider
                    .autoLogin()
                    .then(() => {
                      dispatch(authorised());
                    })
                    .catch(() => {
                      dispatch(invalidToken());
                    })
                );
              } else {
                dispatch(invalidToken());
              }
            });

          loadingPromises.push(verifyingLogin);
        } else if (provider.autoLogin) {
          dispatch(loadingAuthentication());
          loadingPromises.push(
            provider
              .autoLogin()
              .then(() => {
                dispatch(authorised());
              })
              .catch(() => {
                dispatch(loadedAuthentication());
              })
          );
        }

        if (settings['features']) {
          dispatch(loadFeatureSwitches(settings['features']));
        }

        dispatch(addHelpTourSteps(settings['help-tour-steps']));

        if (settings['startUrl']) {
          dispatch(registerStartUrl(settings['startUrl']));
        }

        if (settings['homepageUrl']) {
          dispatch(registerHomepageUrl(settings['homepageUrl']));
        }

        if (settings['ui-strings']) {
          const uiStringResourcesPath = !settings['ui-strings'].startsWith('/')
            ? '/' + settings['ui-strings']
            : settings['ui-strings'];
          const loadingResources = dispatch(loadStrings(uiStringResourcesPath));
          loadingPromises.push(loadingResources);
        }

        // Load the plugin defined in settings
        if (settings['plugins'] && settings.plugins.length > 0) {
          const loadingPlugins = loadMicroFrontends.init(settings.plugins);
          loadingPromises.push(loadingPlugins);
        }

        return Promise.all(loadingPromises).then(() => {
          // if we're on a non-scigateway url, attempt to wait for matching register route event
          // to help prevent showing a 404 page before the right route has been registered
          return new Promise<void>((resolve) => {
            const currUrl = getState().router.location.pathname;
            if (!Object.values(scigatewayRoutes).includes(currUrl)) {
              let eventFired = false;
              const handler = (event: Event): void => {
                const pluginMessage = event as CustomEvent<AnyAction>;
                if (
                  pluginMessage?.detail?.type === RegisterRouteType &&
                  currUrl === pluginMessage.detail.payload.link
                ) {
                  dispatch(siteLoadingUpdate(false));
                  eventFired = true;
                  document.removeEventListener('scigateway', handler);
                  resolve();
                }
              };

              setTimeout(function () {
                if (!eventFired) {
                  dispatch(siteLoadingUpdate(false));
                }
                document.removeEventListener('scigateway', handler);
                resolve();
              }, 3000);

              document.addEventListener('scigateway', handler);
            } else {
              dispatch(siteLoadingUpdate(false));
              resolve();
            }
          });
        });
      })
      .catch((error) => {
        log.error(`Error loading settings.json: ${error.message}`);
      });

    // load dark mode preference from local storage into store
    // otherwise, fetch system preference
    const darkModeLocalStorage = localStorage.getItem('darkMode');
    if (darkModeLocalStorage) {
      const preference = darkModeLocalStorage === 'true' ? true : false;
      dispatch(loadDarkModePreference(preference));
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq) dispatch(loadDarkModePreference(mq.matches));
    }

    const provider = getState().scigateway.authorisation.provider;
    if (provider.fetchScheduledMaintenanceState) {
      provider
        .fetchScheduledMaintenanceState()
        .then((scheduledMaintenanceState) => {
          dispatch(loadScheduledMaintenanceState(scheduledMaintenanceState));

          // Checking the state in the GET response because it does not get
          // loaded into the store before this check is performed
          if (scheduledMaintenanceState['show']) {
            displayScheduledMaintenanceBanner(
              scheduledMaintenanceState['message']
            );
          }
        });
    }
  };
};

const displayScheduledMaintenanceBanner = (message: string): void => {
  document.dispatchEvent(
    new CustomEvent('scigateway', {
      detail: {
        type: NotificationType,
        payload: {
          severity: 'warning',
          message: message,
        },
      },
    })
  );
};

export const toggleDrawer = (): Action => ({
  type: ToggleDrawerType,
});

export const toggleHelp = (): Action => ({
  type: ToggleHelpType,
});

export const signOut = (): ThunkAction<void, StateType, null, AnyAction> => (
  dispatch
) => {
  dispatch({ type: SignOutType });
  dispatch(push('/'));
};

export const verifyUsernameAndPassword = (
  username: string,
  password: string
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    // will be replaced with call to login API for authentification
    dispatch(loadingAuthentication());
    const authProvider = getState().scigateway.authorisation.provider;
    await authProvider
      .logIn(username, password)
      .then(() => {
        dispatch(authorised());

        // redirect the user to the original page they were trying to get to
        // the referrer is added by the redirect in routing.component.tsx
        const previousRouteState = getState().router.location.state;
        dispatch(
          push(
            previousRouteState && previousRouteState.referrer
              ? previousRouteState.referrer
              : '/'
          )
        );
      })
      .catch(() => {
        // probably want to do something smarter with
        // err.response.status (e.g. 403 or 500)
        dispatch(unauthorised());
      });
  };
};

export const setScheduledMaintenanceState = (
  scheduledMaintenanceState: ScheduledMaintenanceState
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const authProvider = getState().scigateway.authorisation.provider;
    if (authProvider.setScheduledMaintenanceState) {
      await authProvider
        .setScheduledMaintenanceState(scheduledMaintenanceState)
        .then(() => {
          dispatch(loadScheduledMaintenanceState(scheduledMaintenanceState));
        });
    }
  };
};

export const setMaintenanceState = (
  maintenanceState: MaintenanceState
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    const authProvider = getState().scigateway.authorisation.provider;
    if (authProvider.setMaintenanceState) {
      await authProvider.setMaintenanceState(maintenanceState).then(() => {
        dispatch(loadMaintenanceState(maintenanceState));
      });
    }
  };
};

export const requestPluginRerender = (): ActionType<{
  broadcast: boolean;
}> => ({
  type: RequestPluginRerenderType,
  payload: {
    broadcast: true,
  },
});

export const sendThemeOptions = (
  theme: Theme
): ActionType<SendThemeOptionsPayload> => ({
  type: SendThemeOptionsType,
  payload: {
    theme,
    broadcast: true,
  },
});

export const loadDarkModePreference = (
  darkMode: boolean
): ActionType<LoadDarkModePreferencePayload> => ({
  type: LoadDarkModePreferenceType,
  payload: {
    darkMode: darkMode,
  },
});

export const dismissMenuItem = (
  index: number
): ActionType<DismissNotificationPayload> => {
  return {
    type: DismissNotificationType,
    payload: {
      index,
    },
  };
};
