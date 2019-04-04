import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import { ConnectedRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import * as log from 'loglevel';
import * as React from 'react';
import { Provider } from 'react-redux';
import { AnyAction, applyMiddleware, compose, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import thunk, { ThunkDispatch } from 'redux-thunk';
import MainAppBar from './mainAppBar/mainAppBar.component';
import NavigationDrawer from './navigationDrawer/navigationDrawer.component';
import Routing from './routing.component';
import { configureSite } from './state/actions/daaas.actions';
import DaaasMiddleware, {
  listenToPlugins,
} from './state/middleware/daaas.middleware';
import AppReducer from './state/reducers/App.reducer';
import { StateType } from './state/state.types';
import './index.css';

const theme = createMuiTheme({
  palette: {
    primary: blue,
  },
  typography: {
    useNextVariants: true,
  },
});

const history = createBrowserHistory();

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

const pageContent = (): React.ReactNode => (
  <React.Fragment>
    <MainAppBar />
    <NavigationDrawer />
    <Routing />
  </React.Fragment>
);

class App extends React.Component {
  public render(): React.ReactElement {
    return (
      <div className="App">
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <MuiThemeProvider theme={theme}>{pageContent()}</MuiThemeProvider>
          </ConnectedRouter>
        </Provider>
      </div>
    );
  }
}

export default App;
