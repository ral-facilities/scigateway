export interface DaaasState {
  notifications: string[];
}

export interface StateType {
  daaas: DaaasState;
}

export interface ActionType<T> {
  type: string;
  payload: T;
}
