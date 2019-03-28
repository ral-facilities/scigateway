import axios from 'axios';
import {
  NotificationType,
  NotificationPayload,
  ToggleDrawerType,
  LoginType,
  LoginPayload,
} from '../daaas.types';
import { ActionType, ThunkResult } from '../state.types';
import { Action } from 'redux';

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
  };
};

export const toggleDrawer = (): Action => ({
  type: ToggleDrawerType,
});

export const verifyUsernameAndPassword = (
  username: string,
  password: string
): ActionType<LoginPayload> => ({
  type: LoginType,
  payload: {
    username,
    password,
  },
});
