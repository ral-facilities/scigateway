export const NotificationType = 'daaas:notification';
export const ToggleDrawerType = 'daaas:toggledrawer';
export const LoginType = 'daaas:login';
export const AuthSuccessType = 'daaas:auth_success';
export const AuthFailureType = 'daaas:auth_failure';

export interface NotificationPayload {
  message: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AccessPayload {
  authorisation: boolean;
  accessToken: string;
  error: null;
}

export interface AuthorisedPayload {
  token: string;
}
