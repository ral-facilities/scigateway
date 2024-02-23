import { ConnectedRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import * as log from 'loglevel';
import * as React from 'react';
import { Provider } from 'react-redux';
import { AnyAction, applyMiddleware, compose, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import { thunk, ThunkDispatch } from 'redux-thunk';
import {
  configureSite,
  loadMaintenanceState,
} from './state/actions/scigateway.actions';
import ScigatewayMiddleware, {
  autoLoginMiddleware,
  listenToPlugins,
} from './state/middleware/scigateway.middleware';
import AppReducer from './state/reducers/App.reducer';
import { StateType } from './state/state.types';
import './index.css';
import { ConnectedThemeProvider } from './theming';
import ReduxToastr from 'react-redux-toastr';
import PageContainer from './pageContainer.component';
import { Preloader } from './preloader/preloader.component';
import { WithTranslation, withTranslation } from 'react-i18next';

const history = createBrowserHistory();

const middleware = [
  thunk,
  routerMiddleware(history),
  ScigatewayMiddleware,
  autoLoginMiddleware,
];
if (process.env.NODE_ENV === `development`) {
  const logger = createLogger({ collapsed: true });
  middleware.push(logger);
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

class App extends React.Component<WithTranslation> {
  public componentDidMount(): void {
    // Check for changes in maintenance state. Ensures that state changes are
    // loaded when a user does not reload the site for longer than 5 minutes.
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

            // Reload the page if maintenance state changes from true to false
            if (storedMaintenanceState.show && !fetchedMaintenanceState.show)
              window.location.reload();
          }
        });
      }
    }, 1000 * 60 * 5);
  }

  public render(): React.ReactElement {
    return (
      <div className="App">
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <ConnectedThemeProvider>
              {this.props.tReady ? (
                <>
                  {toastrConfig()}
                  <PageContainer />
                </>
              ) : (
                <Preloader fullScreen loading />
              )}
            </ConnectedThemeProvider>
          </ConnectedRouter>
        </Provider>
      </div>
    );
  }
}

// export app with no hoc for testing
export { App as AppSansHoc };

export default withTranslation()(App);
