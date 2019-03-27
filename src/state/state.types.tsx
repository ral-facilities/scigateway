import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';

export interface Plugin {
  name: string;
  src: string;
  enable: boolean;
  location: 'main' | 'left' | 'right';
}

export interface DaaasState {
  notifications: string[];
  drawerOpen: boolean;
}

export interface StateType {
  daaas: DaaasState;
}

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<R, StateType, null, AnyAction>;
