export const NotificationType = 'daaas:notification';
export const ToggleDrawerType = 'daaas:toggledrawer';
export const LoginType = 'daaas:login';

export interface NotificationPayload {
  message: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}
