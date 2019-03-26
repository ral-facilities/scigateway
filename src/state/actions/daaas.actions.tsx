import axios from 'axios';
import {
  NotificationType,
  NotificationPayload,
  ToggleDrawerType,
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
