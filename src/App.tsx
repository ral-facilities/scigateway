import { ConnectedRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import * as log from 'loglevel';
import * as React from 'react';
import { Provider } from 'react-redux';
import { AnyAction, applyMiddleware, compose, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import thunk, { ThunkDispatch } from 'redux-thunk';
import {
  configureSite,
  loadMaintenanceState,
} from './state/actions/scigateway.actions';
import ScigatewayMiddleware, {
  listenToPlugins,
} from './state/middleware/scigateway.middleware';
import AppReducer from './state/reducers/App.reducer';
import { StateType } from './state/state.types';
import './index.css';
import { ConnectedThemeProvider } from './theming';
import ReduxToastr from 'react-redux-toastr';
import PageContainer from './pageContainer.component';
import {
  StylesProvider,
  createGenerateClassName,
} from '@material-ui/core/styles';

const generateClassName = createGenerateClassName({
  productionPrefix: 'sgw',
  disableGlobal: true,
});

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

// Check for changes in maintenance state. Ensures that state changes are
// loaded when a user does not reload the site for longer than an hour.
setInterval(() => {
  const provider = getState().scigateway.authorisation.provider;
  if (provider.fetchMaintenanceState) {
    const storedMaintenanceState = getState().scigateway.maintenance;
    provider.fetchMaintenanceState().then((fetchedMaintenanceState) => {
      if (
        storedMaintenanceState.show !== fetchedMaintenanceState.show ||
        storedMaintenanceState.message !== fetchedMaintenanceState.message
      ) {
        dispatch(loadMaintenanceState(fetchedMaintenanceState));
      }
    });
  }
}, 1000 * 60 * 60);

const toastrConfig = (): React.ReactElement => (
  <ReduxToastr
    timeOut={0}
    newestOnTop={false}
    closeOnToastrClick={true}
    position="top-center"
    preventDuplicates
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
            <StylesProvider generateClassName={generateClassName}>
              <ConnectedThemeProvider>
                {toastrConfig()}
                <PageContainer />
              </ConnectedThemeProvider>
            </StylesProvider>
          </ConnectedRouter>
        </Provider>
      </div>
    );
  }
}

export default App;
