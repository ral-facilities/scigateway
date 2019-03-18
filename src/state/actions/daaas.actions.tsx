import { NotificationType, NotificationPayload } from '../daaas.types';
import { ActionType } from '../state.types';

export const daaasNotification = (
  message: string
): ActionType<NotificationPayload> => ({
  type: NotificationType,
  payload: {
    message,
  },
});
