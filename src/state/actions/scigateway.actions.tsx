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
  AutoLoginSuccessType,
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
  RegisterHomepageUrlType,
  RequestPluginRerenderType,
  ScheduledMaintenanceState,
  ScheduledMaintenanceStatePayLoad,
  SendThemeOptionsPayload,
  SendThemeOptionsType,
  SignOutType,
  SiteLoadingPayload,
  SiteLoadingType,
  HomepageUrlPayload,
  CustomLogoPayload,
  ToggleDrawerType,
  ToggleHelpType,
  RegisterRouteType,
  scigatewayRoutes,
  CustomLogoType,
  LoadHighContrastModePreferenceType,
  LoadHighContrastModePreferencePayload,
  ResetAuthStateType,
  CustomNavigationDrawerLogoPayload,
  CustomNavigationDrawerLogoType,
  CustomAdminPageDefaultTabPayload,
  CustomAdminPageDefaultTabType,
  RegisterContactUsAccessibilityFormUrlType,
  ContactUsAccessibilityFormUrlPayload,
  adminRoutes,
} from '../scigateway.types';
import { ActionType, LogoState, StateType, ThunkResult } from '../state.types';
import loadMicroFrontends from './loadMicroFrontends';
import * as singleSpa from 'single-spa';

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

export const registerHomepageUrl = (
  homepageUrl: string
): ActionType<HomepageUrlPayload> => ({
  type: RegisterHomepageUrlType,
  payload: {
    homepageUrl: homepageUrl,
  },
});

export const customLogo = (logo: string): ActionType<CustomLogoPayload> => ({
  type: CustomLogoType,
  payload: {
    logo: logo,
  },
});

export const customNavigationDrawerLogo = (
  navigationDrawerLogo: LogoState
): ActionType<CustomNavigationDrawerLogoPayload> => ({
  type: CustomNavigationDrawerLogoType,
  payload: {
    navigationDrawerLogo: navigationDrawerLogo,
  },
});

export const customAdminPageDefaultTab = (
  adminPageDefaultTab: 'maintenance' | 'download'
): ActionType<CustomAdminPageDefaultTabPayload> => ({
  type: CustomAdminPageDefaultTabType,
  payload: {
    adminPageDefaultTab: adminPageDefaultTab,
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

export const autoLoginAuthorised = (): Action => ({
  type: AutoLoginSuccessType,
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

            // If enabled, display the maintenance banner.
            if (maintenanceState['show']) {
              displayMaintenanceBanner(maintenanceState['message'], 'warning');
            }
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

        if (settings['homepageUrl']) {
          dispatch(registerHomepageUrl(settings['homepageUrl']));
        }

        if (settings['contactUsAccessibilityFormUrl']) {
          dispatch(
            registerContactUsAccessibilityFormUrl(
              settings['contactUsAccessibilityFormUrl']
            )
          );
        }

        if (settings['logo']) {
          dispatch(customLogo(settings['logo']));
        }

        if (
          settings['navigationDrawerLogo'] &&
          Object.keys(settings['navigationDrawerLogo']).length === 3 &&
          !Object.values(settings['navigationDrawerLogo']).includes('')
        ) {
          dispatch(
            customNavigationDrawerLogo(settings['navigationDrawerLogo'])
          );
        }

        if (
          settings['adminPageDefaultTab'] &&
          (settings['adminPageDefaultTab'].includes('maintenance') ||
            settings['adminPageDefaultTab'].includes('download'))
        ) {
          dispatch(customAdminPageDefaultTab(settings['adminPageDefaultTab']));
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
          // if we're on a non-scigateway url that isn't in plugins yet, attempt to wait for matching register route event
          // to help prevent showing a 404 page before the right route has been registered
          return new Promise<void>((resolve) => {
            const currUrl = getState().router.location.pathname;
            if (
              !Object.values(scigatewayRoutes).includes(currUrl) &&
              currUrl !== adminRoutes.maintenance &&
              !getState().scigateway.plugins.find((p) =>
                currUrl.startsWith(p.link.split('?')[0])
              )
            ) {
              let eventFired = false;
              const handler = (event: Event): void => {
                const pluginMessage = event as CustomEvent<AnyAction>;
                if (
                  pluginMessage?.detail?.type === RegisterRouteType &&
                  currUrl.startsWith(
                    pluginMessage.detail.payload.link.split('?')[0]
                  )
                ) {
                  dispatch(siteLoadingUpdate(false));
                  eventFired = true;
                  document.removeEventListener('scigateway', handler);
                  singleSpa.start();
                  resolve();
                }
              };

              setTimeout(function () {
                if (!eventFired) {
                  dispatch(siteLoadingUpdate(false));
                }
                document.removeEventListener('scigateway', handler);
                singleSpa.start();
                resolve();
              }, 3000);

              document.addEventListener('scigateway', handler);
            } else {
              dispatch(siteLoadingUpdate(false));
              singleSpa.start();
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
    const highContrastModeLocalStorage =
      localStorage.getItem('highContrastMode');
    if (highContrastModeLocalStorage)
      dispatch(
        loadHighContrastModePreference(
          highContrastModeLocalStorage === 'true' ? true : false
        )
      );

    const provider = getState().scigateway.authorisation.provider;
    if (provider.fetchScheduledMaintenanceState) {
      provider
        .fetchScheduledMaintenanceState()
        .then((scheduledMaintenanceState) => {
          dispatch(loadScheduledMaintenanceState(scheduledMaintenanceState));

          // Checking the state in the GET response because it does not get
          // loaded into the store before this check is performed
          if (scheduledMaintenanceState['show']) {
            displayMaintenanceBanner(
              scheduledMaintenanceState['message'],
              'warning'
            );
          }
        });
    }
  };
};

const displayMaintenanceBanner = (
  message: string,
  severity: 'success' | 'warning' | 'error',
  instant = false
): void => {
  document.dispatchEvent(
    new CustomEvent('scigateway', {
      detail: {
        type: NotificationType,
        payload: {
          severity,
          message,
          instant,
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

export const signOut =
  (): ThunkAction<void, StateType, null, AnyAction> => (dispatch) => {
    dispatch({ type: SignOutType });
    dispatch(push('/'));
  };

export const resetAuthState = (): Action => ({
  type: ResetAuthStateType,
});

export const verifyUsernameAndPassword = (
  username: string,
  password: string,
  newMnemonic: string | undefined,
  authUrl: string
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    // will be replaced with call to login API for authentification
    dispatch(loadingAuthentication());
    const authProvider = getState().scigateway.authorisation.provider;
    authProvider.mnemonic = newMnemonic;
    authProvider.authUrl = authUrl;
    await authProvider
      .logIn(username, password)
      .then(() => {
        const referrer = getState().router.location.state?.referrer;

        if (newMnemonic)
          dispatch(loadAuthProvider(`icat.${newMnemonic}`, `${authUrl}`));
        dispatch(authorised());

        // redirect the user to the original page they were trying to get to
        // the referrer is added by the redirect in authorisedRoute.component.tsx
        dispatch(push(referrer ?? '/'));
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
        .then((message) => {
          dispatch(loadScheduledMaintenanceState(scheduledMaintenanceState));

          // Displaying the banner to show that the state has been updated.
          if (message) {
            displayMaintenanceBanner(message, 'success', true);
          }
        })
        .catch(() => {
          displayMaintenanceBanner(
            'An error occurred when attempting to save. Try again or contact the support team.',
            'error',
            true
          );
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
      await authProvider
        .setMaintenanceState(maintenanceState)
        .then((message) => {
          dispatch(loadMaintenanceState(maintenanceState));

          // Displaying the banner to show that the state has been updated.
          if (message) {
            displayMaintenanceBanner(message, 'success', true);
          }
        })
        .catch(() => {
          displayMaintenanceBanner(
            'An error occurred when attempting to save. Try again or contact the support team.',
            'error',
            true
          );
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

export const loadHighContrastModePreference = (
  highContrastMode: boolean
): ActionType<LoadHighContrastModePreferencePayload> => ({
  type: LoadHighContrastModePreferenceType,
  payload: {
    highContrastMode: highContrastMode,
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

export const registerContactUsAccessibilityFormUrl = (
  contactUsAccessibilityFormUrl: string
): ActionType<ContactUsAccessibilityFormUrlPayload> => ({
  type: RegisterContactUsAccessibilityFormUrlType,
  payload: {
    contactUsAccessibilityFormUrl: contactUsAccessibilityFormUrl,
  },
});
