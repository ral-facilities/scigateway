import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import {
  ApplicationStrings,
  PluginConfig,
  FeatureSwitches,
} from './daaas.types';
import { RouterState } from 'connected-react-router';

export interface Plugin {
  name: string;
  src: string;
  enable: boolean;
  location: 'main' | 'left' | 'right';
}

export interface DaaasState {
  notifications: string[];
  plugins: PluginConfig[];
  drawerOpen: boolean;
  authorisation: AuthState;
  res?: ApplicationStrings;
  features: FeatureSwitches;
}

export interface StateType {
  daaas: DaaasState;
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

export interface AuthProvider {
  isLoggedIn: () => boolean;
  logOut: () => void;
  logIn: (username: string, password: string) => Promise<void>;
  verifyLogIn: () => Promise<void>;
  redirectUrl: string | null;
  user: User | null;
}

export interface AuthState {
  failedToLogin: boolean;
  signedOutDueToTokenExpiry: boolean;
  loading: boolean;
  provider: AuthProvider;
}
