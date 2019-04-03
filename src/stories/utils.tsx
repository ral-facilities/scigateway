import { action } from '@storybook/addon-actions';
import { AnyAction } from 'redux';
import { resolve } from 'bluebird';

type FakeReduxActionReturnType = () => AnyAction;

export const FakeReduxAction = (
  message: string
): FakeReduxActionReturnType => () => {
  action(message)();
  return { type: 'storybook' };
};

type FakeAsyncReturnType = () => Promise<void>;

export const FakeAsyncAction = (message: string): FakeAsyncReturnType => () => {
  const promise = new Promise<void>(resolve);
  FakeReduxAction(message);
  return promise;
};
