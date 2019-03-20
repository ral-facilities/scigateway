import { combineReducers, Reducer } from 'redux';
import { connectRouter } from 'connected-react-router';
import daaasReducer from './daaas.reducer';
import { History } from 'history';

const AppReducer = (history: History): Reducer =>
  combineReducers({
    router: connectRouter(history),
    daaas: daaasReducer,
  });

export default AppReducer;
