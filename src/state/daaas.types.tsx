export const AuthSuccessType = 'daaas:auth_success';
export const AuthFailureType = 'daaas:auth_failure';
export const LoadingAuthType = 'daaas:loading_auth';
export const ConfigureStringsType = 'daaas:configure_strings';
export const LoginType = 'daaas:login';
export const NotificationType = 'daaas:api:notification';
export const RegisterRouteType = 'daaas:api:register_route';
export const SignOutType = 'daaas:signout';
export const ToggleDrawerType = 'daaas:toggledrawer';
export const ConfigureFeatureSwitchesType = 'daaas:feature_switches';

export interface NotificationPayload {
  message: string;
  id: string;
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
}

export interface PluginConfig {
  section: string;
  link: string;
  plugin: string;
  displayName: string;
  order: number;
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
