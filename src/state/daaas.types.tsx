export const NotificationType = 'daaas:notification';
export const ToggleDrawerType = 'daaas:toggledrawer';
export const RegisterRouteType = 'daaas:api:register_route';
export const LoginType = 'daaas:login';
export const AuthSuccessType = 'daaas:auth_success';
export const AuthFailureType = 'daaas:auth_failure';

export interface NotificationPayload {
  message: string;
}

export interface RegisterRoutePayload {
  section: string;
  link: string;
  plugin: string;
  displayName: string;
  order: number;
}

export interface GroupedPlugins {
  [section: string]: RegisterRoutePayload[];
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
