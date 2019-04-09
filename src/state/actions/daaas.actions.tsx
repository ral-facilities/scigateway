import axios from 'axios';
import { Action } from 'redux';
import * as log from 'loglevel';
import {
  ConfigureStringsType,
  ConfigureStringsPayload,
  NotificationType,
  NotificationPayload,
  ToggleDrawerType,
  AuthFailureType,
  AuthorisedPayload,
  AuthSuccessType,
  ApplicationStrings,
  SignOutType,
  FeatureSwitchesPayload,
  ConfigureFeatureSwitchesType,
  FeatureSwitches,
} from '../daaas.types';
import { ActionType, ThunkResult } from '../state.types';
import loadMicroFrontends from './loadMicroFrontends';

export const daaasNotification = (
  message: string
): ActionType<NotificationPayload> => ({
  type: NotificationType,
  payload: {
    message,
  },
});

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
      dispatch(daaasNotification(JSON.stringify(settings)));
      dispatch(loadStrings(settings['ui-strings']));
      loadMicroFrontends.init(settings.plugins);
    });
  };
};

export const toggleDrawer = (): Action => ({
  type: ToggleDrawerType,
});

export const signOut = (): Action => ({
  type: SignOutType,
});

export const unauthorised = (): Action => ({
  type: AuthFailureType,
});

export const authorised = (token: string): ActionType<AuthorisedPayload> => ({
  type: AuthSuccessType,
  payload: {
    token,
  },
});

export const verifyUsernameAndPassword = (
  username: string,
  password: string
): ThunkResult<Promise<void>> => {
  return async dispatch => {
    // will be replaced with call to login API for authentification
    const res = axios.get(`/settings.json`).then(() => {
      if (username === 'INVALID_NAME' && password != null) {
        console.log(`Axios response was ${res}`);
        dispatch(unauthorised());
      } else {
        const token = 'validLoginToken';
        dispatch(authorised(token));
      }
    });
  };
};
