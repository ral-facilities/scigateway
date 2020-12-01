import React from 'react';
import { action } from '@storybook/addon-actions';
import { AnyAction, Middleware, Dispatch } from 'redux';
import { initialState } from '../state/reducers/scigateway.reducer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { storybookResourceStrings } from './storybookResourceStrings';
import { DecoratorFn } from '@storybook/react';
import { ScigatewayState } from '../state/state.types';
import thunk from 'redux-thunk';
import log from 'loglevel';

type FakeReduxActionReturnType = () => AnyAction;

export const FakeReduxAction = (
  message: string
): FakeReduxActionReturnType => () => {
  action(message)();
  return { type: 'storybook' };
};

type FakeAsyncReturnType = () => Promise<void>;

export const FakeAsyncAction = (message: string): FakeAsyncReturnType => () => {
  log.debug('async action called');
  return new Promise<void>((resolve) => {
    action(message)();
    resolve();
  });
};

const StorybookMiddleware: Middleware = (() => (next: Dispatch<AnyAction>) => (
  reduxAction: AnyAction
): AnyAction => {
  action(JSON.stringify(reduxAction))();

  return next(reduxAction);
}) as Middleware;

type StateUpdater = (state: ScigatewayState) => ScigatewayState;
type ReduxDecoratorGeneratorType = (updater: StateUpdater) => DecoratorFn;

/* eslint-disable-next-line react/display-name */
export const ReduxDecorator: ReduxDecoratorGeneratorType = ((stateUpdater) => (
  storyFn
) => {
  const state = { scigateway: initialState };
  state.scigateway.res = storybookResourceStrings;
  return (
    <Provider
      store={configureStore([thunk, StorybookMiddleware])({
        scigateway: stateUpdater(state.scigateway),
        router: {
          action: 'POP',
          location: {
            hash: '',
            key: '',
            pathname: '/',
            search: '',
            state: {},
          },
        },
      })}
    >
      {storyFn()}
    </Provider>
  );
}) as ReduxDecoratorGeneratorType;
