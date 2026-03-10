import { reducer as toastrReducer } from 'react-redux-toastr';
import { combineReducers, Reducer } from 'redux';
import scigatewayReducer from './scigateway.reducer';

const AppReducer = (): Reducer =>
  combineReducers({
    scigateway: scigatewayReducer,
    toastr: toastrReducer,
  });

export default AppReducer;
