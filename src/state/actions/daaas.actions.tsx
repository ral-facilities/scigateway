import axios from 'axios';
import { Action, AnyAction } from 'redux';
import log from 'loglevel';
import {
  ConfigureStringsType,
  ConfigureStringsPayload,
  ToggleDrawerType,
  AuthFailureType,
  AuthSuccessType,
  ApplicationStrings,
  SignOutType,
  FeatureSwitchesPayload,
  ConfigureFeatureSwitchesType,
  FeatureSwitches,
  LoadingAuthType,
  DismissNotificationType,
  DismissNotificationPayload,
  RequestPluginRerenderType,
  AuthProviderPayload,
  LoadAuthProviderType,
  SiteLoadingType,
  SiteLoadingPayload,
} from '../daaas.types';
import { ActionType, ThunkResult, StateType } from '../state.types';
import loadMicroFrontends from './loadMicroFrontends';
import { push } from 'connected-react-router';
import { ThunkAction } from 'redux-thunk';

export const configureStrings = (
  appStrings: ApplicationStrings
): ActionType<ConfigureStringsPayload> => ({
  type: ConfigureStringsType,
  payload: {
    res: appStrings,
  },
});

export const loadStrings = (path: string): ThunkResult<Promise<void>> => {
  return async dispatch => {
    await axios
      .get(path)
      .then(res => {
        dispatch(configureStrings(res.data));
      })
      .catch(error =>
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

export const loadAuthProvider = (
  authProvider: string
): ActionType<AuthProviderPayload> => ({
  type: LoadAuthProviderType,
  payload: {
    authProvider,
  },
});

export const unauthorised = (): Action => ({
  type: AuthFailureType,
});

export const authorised = (): Action => ({
  type: AuthSuccessType,
});

export const siteLoadingUpdate = (
  loading: boolean
): ActionType<SiteLoadingPayload> => ({
  type: SiteLoadingType,
  payload: {
    loading,
  },
});

export const configureSite = (): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    await axios
      .get(`/settings.json`)
      .then(res => {
        const settings = res.data;

        // if settings is a string, it is invalid JSON. Use JSON.parse to give detailed error info
        if (typeof settings === 'string') {
          JSON.parse(settings);
        }

        dispatch(loadAuthProvider(settings['auth-provider']));

        const loadingPromises = [];

        // after auth provider is set then the token needs to be verified
        const provider = getState().daaas.authorisation.provider;
        if (provider.isLoggedIn()) {
          const verifyingLogin = provider
            .verifyLogIn()
            .then(() => {
              dispatch(authorised());
            })
            .catch(() => {
              dispatch(unauthorised());
            });

          loadingPromises.push(verifyingLogin);
        }

        if (settings['features']) {
          dispatch(loadFeatureSwitches(settings['features']));
        }

        const uiStringResourcesPath = !settings['ui-strings'].startsWith('/')
          ? '/' + settings['ui-strings']
          : settings['ui-strings'];
        const loadingResources = dispatch(loadStrings(uiStringResourcesPath));
        loadingPromises.push(loadingResources);

        const loadingPlugins = loadMicroFrontends.init(settings.plugins);
        loadingPromises.push(loadingPlugins);

        Promise.all(loadingPromises).then(() => {
          dispatch(siteLoadingUpdate(false));
        });
      })
      .catch(error => {
        log.error(`Error loading settings.json: ${error.message}`);
      });
  };
};

export const toggleDrawer = (): Action => ({
  type: ToggleDrawerType,
});

export const signOut = (): ThunkAction<
  void,
  StateType,
  null,
  AnyAction
> => dispatch => {
  dispatch({ type: SignOutType });
  dispatch(push('/'));
};

export const loadingAuthentication = (): Action => ({
  type: LoadingAuthType,
});

export const verifyUsernameAndPassword = (
  username: string,
  password: string
): ThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    // will be replaced with call to login API for authentification
    dispatch(loadingAuthentication());
    const authProvider = getState().daaas.authorisation.provider;
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

export const requestPluginRerender = (): ActionType<{
  broadcast: boolean;
}> => ({
  type: RequestPluginRerenderType,
  payload: {
    broadcast: true,
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
