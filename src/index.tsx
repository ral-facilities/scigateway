import React from 'react';
import ReactDOM from 'react-dom';
import { createLogger } from 'redux-logger';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose, AnyAction } from 'redux';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import './index.css';
import AppReducer from './state/reducers/App.reducer';
import ExampleComponent from './example.component';
import { Route, Switch, Redirect } from 'react-router'; // react-router v4
import { configureSite } from './state/actions/daaas.actions';
import { StateType } from './state/state.types';
import MainAppBar from './mainAppBar/mainAppBar.component';
import LoginPage from './loginPage/loginPage.component';
import NavigationDrawer from './navigationDrawer/navigationDrawer.component';
import * as log from 'loglevel';
import DaaasMiddleware, {
  listenToPlugins,
} from './state/middleware/daaas.middleware';

const history = createBrowserHistory();

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: blue,
  },
});

const middleware = [thunk, routerMiddleware(history), DaaasMiddleware];
if (process.env.NODE_ENV === `development`) {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const logger = (createLogger as any)();
  middleware.push(logger);
  // const {whyDidYouUpdate} = require('why-did-you-update');
  // whyDidYouUpdate(React);
  log.setDefaultLevel(log.levels.DEBUG);
} else {
  log.setDefaultLevel(log.levels.ERROR);
}

/* eslint-disable no-underscore-dangle, @typescript-eslint/no-explicit-any */
const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const store = createStore(
  AppReducer(history),
  composeEnhancers(applyMiddleware(...middleware))
);

listenToPlugins(store.dispatch);

const dispatch = store.dispatch as ThunkDispatch<StateType, null, AnyAction>;
dispatch(configureSite());

console.log(store.getState().authorisation);
const loggedIn = false;

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <MuiThemeProvider theme={theme}>
        <MainAppBar />
        <NavigationDrawer />

        <Switch>
          <Route
            exact
            path="/"
            render={() =>
              loggedIn ? (
                <Redirect to="/">
                  <div>Match</div>
                </Redirect>
              ) : (
                <Redirect to="/login" />
              )
            }
          />
          <Route exact_path="/login" component={LoginPage} />
          <Route render={() => <div>Miss</div>} />
        </Switch>
        <ExampleComponent />
      </MuiThemeProvider>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
