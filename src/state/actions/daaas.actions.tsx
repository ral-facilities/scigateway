import axios from 'axios';
import {
  NotificationType,
  NotificationPayload,
  ToggleDrawerType,
  AuthFailureType,
  AuthorisedPayload,
  AuthSuccessType,
  SignOutType,
} from '../daaas.types';
import { ActionType, ThunkResult } from '../state.types';
import { Action } from 'redux';
import loadMicroFrontends from './loadMicroFrontends';

export const daaasNotification = (
  message: string
): ActionType<NotificationPayload> => ({
  type: NotificationType,
  payload: {
    message,
  },
});

export const configureSite = (): ThunkResult<Promise<void>> => {
  return async dispatch => {
    const res = await axios.get(`/settings.json`);
    const settings = res.data;
    dispatch(daaasNotification(JSON.stringify(settings)));

    loadMicroFrontends.init(settings.plugins);
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
