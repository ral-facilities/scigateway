import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import { RegisterRoutePayload } from './daaas.types';
import { RouterState } from 'connected-react-router';

export interface Plugin {
  name: string;
  src: string;
  enable: boolean;
  location: 'main' | 'left' | 'right';
}

export interface DaaasState {
  notifications: string[];
  plugins: RegisterRoutePayload[];
  drawerOpen: boolean;
  authorisation: AuthState;
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

export interface AuthState {
  token: string;
  failedToLogin: boolean;
  loggedIn: boolean;
}
