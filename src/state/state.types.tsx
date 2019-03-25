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
