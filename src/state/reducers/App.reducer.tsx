import { combineReducers, Reducer } from 'redux';
import { connectRouter } from 'connected-react-router';
import daaasReducer from './daaas.reducer';
import { History } from 'history';
import { reducer as toastrReducer } from 'react-redux-toastr';

const AppReducer = (history: History): Reducer =>
  combineReducers({
    router: connectRouter(history),
    daaas: daaasReducer,
    toastr: toastrReducer,
  });

export default AppReducer;
