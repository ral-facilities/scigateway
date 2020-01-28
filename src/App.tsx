import { MuiThemeProvider } from '@material-ui/core/styles';
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
import Routing from './routing/routing.component';
import { configureSite } from './state/actions/scigateway.actions';
import ScigatewayMiddleware, {
  listenToPlugins,
} from './state/middleware/scigateway.middleware';
import AppReducer from './state/reducers/App.reducer';
import { StateType } from './state/state.types';
import './index.css';
import { buildTheme } from './theming';
import Preloader from './preloader/preloader.component';
import CookieConsent from './cookieConsent/cookieConsent.component';
import ReduxToastr from 'react-redux-toastr';
import Tour from './tour/tour.component';

const history = createBrowserHistory();

const middleware = [thunk, routerMiddleware(history), ScigatewayMiddleware];
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

const getState = store.getState as () => StateType;
listenToPlugins(store.dispatch, getState);

const dispatch = store.dispatch as ThunkDispatch<StateType, null, AnyAction>;
dispatch(configureSite());

const pageContent = (): React.ReactNode => (
  <React.Fragment>
    <Preloader />
    <MainAppBar />
    <NavigationDrawer />
    <Tour />
    <CookieConsent />
    <Routing />
  </React.Fragment>
);

const toastrConfig = (): React.ReactElement => (
  <ReduxToastr
    timeOut={0}
    newestOnTop={false}
    closeOnToastrClick={true}
    position="top-center"
    transitionIn="fadeIn"
    transitionOut="fadeOut"
  />
);

class App extends React.Component {
  public render(): React.ReactElement {
    return (
      <div className="App">
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <MuiThemeProvider theme={buildTheme()}>
              {toastrConfig()}
              {pageContent()}
            </MuiThemeProvider>
          </ConnectedRouter>
        </Provider>
      </div>
    );
  }
}

export default App;
