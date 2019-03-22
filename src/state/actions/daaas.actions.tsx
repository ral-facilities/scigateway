import {
  NotificationType,
  NotificationPayload,
  ToggleDrawerType,
} from '../daaas.types';
import { ActionType } from '../state.types';
import { Action } from 'redux';

export const daaasNotification = (
  message: string
): ActionType<NotificationPayload> => ({
  type: NotificationType,
  payload: {
    message,
  },
});

export const toggleDrawer = (): Action => ({
  type: ToggleDrawerType,
});
