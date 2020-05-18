import { Step } from 'react-joyride';

export const AuthSuccessType = 'scigateway:auth_success';
export const AuthFailureType = 'scigateway:auth_failure';
export const LoadingAuthType = 'scigateway:loading_auth';
export const LoadAuthProviderType = 'scigateway:loading_auth_provider';
export const LoadAuthUrlType = 'scigateway:loading_auth_url';
export const InvalidateTokenType = 'scigateway:api:invalidate_token';
export const ConfigureStringsType = 'scigateway:configure_strings';
export const LoginType = 'scigateway:login';
export const NotificationType = 'scigateway:api:notification';
export const RegisterRouteType = 'scigateway:api:register_route';
export const RequestPluginRerenderType = 'scigateway:api:plugin_rerender';
export const SignOutType = 'scigateway:signout';
export const ToggleDrawerType = 'scigateway:toggledrawer';
export const DismissNotificationType = 'scigateway:dismissnotification';
export const ConfigureFeatureSwitchesType = 'scigateway:feature_switches';
export const AddNotificationsType = 'scigateway:add_notification';
export const SiteLoadingType = 'scigateway:site_loading';
export const ConfigureAnalyticsType = 'scigateway:configure_analytics';
export const InitialiseAnalyticsType = 'scigateway:initialise_analytics';
export const ToggleHelpType = 'scigateway:toggle_help';
export const AddHelpTourStepsType = 'scigateway:add_help_tour_steps';

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
  authUrl: string | undefined;
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
