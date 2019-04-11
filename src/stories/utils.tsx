import { action } from '@storybook/addon-actions';
import { AnyAction } from 'redux';
import loglevel from 'loglevel';

type FakeReduxActionReturnType = () => AnyAction;

export const FakeReduxAction = (
  message: string
): FakeReduxActionReturnType => () => {
  action(message)();
  return { type: 'storybook' };
};

type FakeAsyncReturnType = () => Promise<void>;

export const FakeAsyncAction = (message: string): FakeAsyncReturnType => () => {
  loglevel.debug('async action called');
  return new Promise<void>(resolve => {
    action(message)();
    resolve();
  });
};
