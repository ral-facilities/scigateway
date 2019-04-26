import axios from 'axios';
import { Action, AnyAction } from 'redux';
import log from 'loglevel';
import {
  ConfigureStringsType,
  ConfigureStringsPayload,
  ToggleDrawerType,
  AuthFailureType,
  AuthorisedPayload,
  AuthSuccessType,
  ApplicationStrings,
  SignOutType,
  FeatureSwitchesPayload,
  ConfigureFeatureSwitchesType,
  FeatureSwitches,
  LoadingAuthType,
  DismissNotificationType,
  DismissNotificationPayload,
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

export const configureSite = (): ThunkResult<Promise<void>> => {
  return async dispatch => {
    await axios.get(`/settings.json`).then(res => {
      const settings = res.data;
      if (settings['features']) {
        dispatch(loadFeatureSwitches(settings['features']));
      }

      const uiStringResourcesPath = !settings['ui-strings'].startsWith('/')
        ? '/' + settings['ui-strings']
        : settings['ui-strings'];
      dispatch(loadStrings(uiStringResourcesPath));
      loadMicroFrontends.init(settings.plugins);
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

export const unauthorised = (): Action => ({
  type: AuthFailureType,
});

export const authorised = (token: string): ActionType<AuthorisedPayload> => ({
  type: AuthSuccessType,
  payload: {
    token,
  },
});

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
    await new Promise(resolve => setTimeout(resolve, 3000)).then(() => {
      if (username === 'INVALID_NAME' && password != null) {
        dispatch(unauthorised());
      } else {
        const token = 'validLoginToken';
        dispatch(authorised(token));

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
      }
    });
  };
};

export const showDropdown = (): Action => ({
  type: ToggleDrawerType,
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
