export const NotificationType = 'daaas:notification';
export const ToggleDrawerType = 'daaas:toggledrawer';
export const RegisterRouteType = 'daaas:api:registerroute';

export interface NotificationPayload {
  message: string;
}

export interface RegisterRoutePayload {
  section: string;
  link: string;
  plugin: string;
  displayName: string;
}
