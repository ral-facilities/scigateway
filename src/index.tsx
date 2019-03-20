import React from 'react';
import ReactDOM from 'react-dom';
import { createLogger } from 'redux-logger';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import AppReducer from './state/reducers/App.reducer';
import { daaasNotification } from './state/actions/daaas.actions';
import ExampleComponent from './example.component';
import { Route, Switch } from 'react-router'; // react-router v4

const history = createBrowserHistory();

const middleware = [thunk, routerMiddleware(history)];
if (process.env.NODE_ENV === `development`) {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const logger = (createLogger as any)();
  middleware.push(logger);
  // const {whyDidYouUpdate} = require('why-did-you-update');
  // whyDidYouUpdate(React);
}

/* eslint-disable no-underscore-dangle, @typescript-eslint/no-explicit-any */
const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const store = createStore(
  AppReducer(history),
  composeEnhancers(applyMiddleware(...middleware))
);

setTimeout(() => {
  store.dispatch(daaasNotification('test notification'));
}, 3000);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div>
        <ExampleComponent />
        <App />
        <Switch>
          <Route exact path="/" render={() => <div>Match</div>} />
          <Route render={() => <div>Miss</div>} />
        </Switch>
      </div>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
