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
    axios
      .get(path)
      .then(res => {
        dispatch(configureStrings(res.data));
      })
      .catch(error =>
        log.error(`Failed to read strings from ${path}: ${error}`)
      );
  };
};

export const configureSite = (): ThunkResult<Promise<void>> => {
  return async dispatch => {
    await axios.get(`/settings.json`).then(res => {
      const settings = res.data;
      daaasNotification(JSON.stringify(settings));
      dispatch(loadStrings(settings['ui-strings'])).then(() =>
        loadMicroFrontends.init(settings.plugins)
      );
    });
  };
};

export const toggleDrawer = (): Action => ({
  type: ToggleDrawerType,
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
