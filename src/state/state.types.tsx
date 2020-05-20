import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import { Step } from 'react-joyride';
import {
  ApplicationStrings,
  PluginConfig,
  FeatureSwitches,
} from './scigateway.types';
import { RouterState } from 'connected-react-router';

export interface Plugin {
  name: string;
  src: string;
  enable: boolean;
  location: 'main' | 'left' | 'right';
}

export interface ScigatewayNotification {
  message: string;
  severity: string;
}

export interface ScigatewayState {
  notifications: ScigatewayNotification[];
  plugins: PluginConfig[];
  drawerOpen: boolean;
  siteLoading: boolean;
  showHelp: boolean;
  helpSteps: Step[];
  authorisation: AuthState;
  res?: ApplicationStrings;
  features: FeatureSwitches;
  analytics?: AnalyticsState;
}

export interface StateType {
  scigateway: ScigatewayState;
  router: RouterState;
}

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;

export interface User {
  username: string;
  avatarUrl: string;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ICATAuthenticator {
  mnemonic: string;
  keys: { name: string; hide?: boolean }[];
  friendly?: string;
  admin?: boolean;
}

export interface AuthProvider {
  isLoggedIn: () => boolean;
  logOut: () => void;
  logIn: (username: string, password: string) => Promise<void>;
  verifyLogIn: () => Promise<void>;
  refresh: () => Promise<void>;
  redirectUrl: string | null;
  user: User | null;
  mnemonic?: string;
  autoLogin?: () => Promise<void>;
}

export interface AuthState {
  failedToLogin: boolean;
  signedOutDueToTokenInvalidation: boolean;
  loading: boolean;
  provider: AuthProvider;
}

export interface AnalyticsState {
  id: string;
  initialised: boolean;
}
