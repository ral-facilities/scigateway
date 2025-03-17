/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
// this is a general reducer builder, it needs to accept different types
interface Action {
  type: string;
  payload?: any;
}

function createReducer(initialState: any, handlers: Record<string, any>): any {
  return function reducer(state: any = initialState, action: Action) {
    if (action && Object.hasOwn(handlers, action.type)) {
      return handlers[action.type](state, action.payload);
    }
    return state;
  };
}

export default createReducer;
/* eslint-enable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
