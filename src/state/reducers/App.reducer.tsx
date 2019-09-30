import { combineReducers, Reducer } from 'redux';
import { connectRouter } from 'connected-react-router';
import scigatewayReducer from './scigateway.reducer';
import { History } from 'history';
import { reducer as toastrReducer } from 'react-redux-toastr';

const AppReducer = (history: History): Reducer =>
  combineReducers({
    router: connectRouter(history),
    scigateway: scigatewayReducer,
    toastr: toastrReducer,
  });

export default AppReducer;
