import { NotificationType, NotificationPayload } from '../daaas.types';
import { ActionType, StateType } from '../state.types';
import axios from 'axios';
import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';

export const daaasNotification = (
  message: string
): ActionType<NotificationPayload> => ({
  type: NotificationType,
  payload: {
    message,
  },
});

type MyThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;

export const configureSite = (): MyThunkResult<Promise<void>> => {
  return async dispatch => {
    const res = await axios.get(`/settings.json`);
    const settings = res.data;
    dispatch(daaasNotification(JSON.stringify(settings)));
  };
};
