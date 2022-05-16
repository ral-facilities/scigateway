import { Theme } from '@mui/material';
import { Step } from 'react-joyride';
import { LogoState } from './state.types';

export const AuthSuccessType = 'scigateway:auth_success';
export const AuthFailureType = 'scigateway:auth_failure';
export const AutoLoginSuccessType = 'scigateway:autologin_success';
export const LoadingAuthType = 'scigateway:loading_auth';
export const LoadedAuthType = 'scigateway:loaded_auth';
export const LoadAuthProviderType = 'scigateway:loading_auth_provider';
export const LoadScheduledMaintenanceStateType =
  'scigateway:load_scheduled_maintenance_state';
export const LoadMaintenanceStateType = 'scigateway:load_maintenance_state';
export const InvalidateTokenType = 'scigateway:api:invalidate_token';
export const ConfigureStringsType = 'scigateway:configure_strings';
export const LoginType = 'scigateway:login';
export const NotificationType = 'scigateway:api:notification';
export const RegisterRouteType = 'scigateway:api:register_route';
export const RequestPluginRerenderType = 'scigateway:api:plugin_rerender';
export const SendThemeOptionsType = 'scigateway:api:send_themeoptions';
export const LoadDarkModePreferenceType =
  'scigateway:load_dark_mode_preference';
export const LoadHighContrastModePreferenceType =
  'scigateway:load_high_contrast_mode_preference';
export const SignOutType = 'scigateway:signout';
export const ResetAuthStateType = 'scigateway:reset_auth_state';
export const BroadcastSignOutType = 'scigateway:api:signout';
export const ToggleDrawerType = 'scigateway:toggledrawer';
export const DismissNotificationType = 'scigateway:dismissnotification';
export const ConfigureFeatureSwitchesType = 'scigateway:feature_switches';
export const AddNotificationsType = 'scigateway:add_notification';
export const SiteLoadingType = 'scigateway:site_loading';
export const ConfigureAnalyticsType = 'scigateway:configure_analytics';
export const InitialiseAnalyticsType = 'scigateway:initialise_analytics';
export const ToggleHelpType = 'scigateway:toggle_help';
export const AddHelpTourStepsType = 'scigateway:add_help_tour_steps';
export const RegisterHomepageUrlType = 'scigateway:register_homepage_url';
export const CustomLogoType = 'scigateway:custom_logo';
export const CustomNavigationDrawerLogoType =
  'scigateway:custom_navigation_drawer_logo';
export const CustomAdminPageDefaultTabType =
  'scigateway:custom_admin_default_tab';
export const RegisterContactUsAccessibilityFormUrlType =
  'scigateway:contact_us_accessibility_form_url';

export const scigatewayRoutes = {
  home: '/',
  contact: '/contact',
  help: '/help',
  admin: '/admin',
  login: '/login',
  logout: '/logout',
  cookies: '/cookies',
  accessibility: '/accessibility',
};
export const adminRoutes = {
  maintenance: '/admin/maintenance',
  download: '/admin/download',
};

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
  showHelpPageButton: boolean;
  singlePluginLogo: boolean;
}

export interface HomepageUrlPayload {
  homepageUrl: string;
}

export interface CustomLogoPayload {
  logo: string;
}

export interface CustomNavigationDrawerLogoPayload {
  navigationDrawerLogo: LogoState;
}

export interface CustomAdminPageDefaultTabPayload {
  adminPageDefaultTab: 'maintenance' | 'download';
}

export interface RegisterRoutePayload {
  section: string;
  link: string;
  plugin: string;
  displayName: string;
  hideFromMenu?: boolean;
  admin?: boolean;
  order: number;
  helpText?: string;
  logoLightMode?: string;
  logoDarkMode?: string;
  logoAltText?: string;
  helpSteps?: { target: string; content: string }[];
}

export interface PluginConfig {
  section: string;
  link: string;
  plugin: string;
  displayName: string;
  hideFromMenu?: boolean;
  admin?: boolean;
  order: number;
  helpText?: string;
  logoLightMode?: string;
  logoDarkMode?: string;
  logoAltText?: string;
  helpSteps?: { target: string; content: string }[];
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

export interface SendThemeOptionsPayload {
  theme: Theme;
  broadcast: boolean;
}

export interface LoadDarkModePreferencePayload {
  darkMode: boolean;
}

export interface LoadHighContrastModePreferencePayload {
  highContrastMode: boolean;
}

export interface DismissNotificationPayload {
  index: number;
}

export interface AuthProviderPayload {
  authProvider: string;
  authUrl: string | undefined;
}

export interface ScheduledMaintenanceStatePayLoad {
  scheduledMaintenance: ScheduledMaintenanceState;
}

export interface ScheduledMaintenanceState {
  show: boolean;
  message: string;
}

export interface MaintenanceStatePayLoad {
  maintenance: MaintenanceState;
}

export interface MaintenanceState {
  show: boolean;
  message: string;
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

export interface ContactUsAccessibilityFormUrlPayload {
  contactUsAccessibilityFormUrl: string;
}
