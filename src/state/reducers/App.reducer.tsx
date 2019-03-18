import { combineReducers } from 'redux';
import daaasReducer from './daaas.reducer';

const AppReducer = combineReducers({
  daaas: daaasReducer,
});

export default AppReducer;
