import { Step } from 'react-joyride';

export const AuthSuccessType = 'daaas:auth_success';
export const AuthFailureType = 'daaas:auth_failure';
export const LoadingAuthType = 'daaas:loading_auth';
export const LoadAuthProviderType = 'daaas:loading_auth_provider';
export const TokenExpiredType = 'daaas:expired_token';
export const ConfigureStringsType = 'daaas:configure_strings';
export const LoginType = 'daaas:login';
export const NotificationType = 'daaas:api:notification';
export const RegisterRouteType = 'daaas:api:register_route';
export const RequestPluginRerenderType = 'daaas:api:plugin_rerender';
export const SignOutType = 'daaas:signout';
export const ToggleDrawerType = 'daaas:toggledrawer';
export const DismissNotificationType = 'daaas:dismissnotification';
export const ConfigureFeatureSwitchesType = 'daaas:feature_switches';
export const AddNotificationsType = 'daaas:add_notification';
export const SiteLoadingType = 'daaas:site_loading';
export const ConfigureAnalyticsType = 'daaas:configure_analytics';
export const InitialiseAnalyticsType = 'daaas:initialise_analytics';
export const ToggleHelpType = 'daaas:toggle_help';
export const AddHelpTourStepsType = 'daaas:add_help_tour_steps';

export interface NotificationPayload {
  message: string;
  severity: string;
}

export interface AddNotificationsPayload {
  notifications: NotificationPayload[];
}

export interface AppStrings {
  [id: string]: string;
}

export interface ConfigureStringsPayload {
  res: ApplicationStrings;
}

export interface ApplicationStrings {
  [section: string]: AppStrings;
}

export interface FeatureSwitchesPayload {
  switches: FeatureSwitches;
}

export interface FeatureSwitches {
  showContactButton: boolean;
}

export interface RegisterRoutePayload {
  section: string;
  link: string;
  plugin: string;
  displayName: string;
  order: number;
  helpText?: string;
}

export interface PluginConfig {
  section: string;
  link: string;
  plugin: string;
  displayName: string;
  order: number;
  helpText?: string;
}

export interface GroupedPlugins {
  [section: string]: PluginConfig[];
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

export interface DismissNotificationPayload {
  index: number;
}

export interface AuthProviderPayload {
  authProvider: string;
}

export interface SiteLoadingPayload {
  loading: boolean;
}

export interface ConfigureAnalyticsPayload {
  id: string;
}

export interface AddHelpTourStepsPayload {
  steps: Step[];
}
