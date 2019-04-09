import { action } from '@storybook/addon-actions';
import { AnyAction } from 'redux';

type FakeReduxActionReturnType = () => AnyAction;

export const FakeReduxAction = (
  message: string
): FakeReduxActionReturnType => () => {
  action(message)();
  return { type: 'storybook' };
};

type FakeAsyncReturnType = () => Promise<void>;

export const FakeAsyncAction = (message: string): FakeAsyncReturnType => () => {
  console.log('async action called');
  return new Promise<void>(resolve => {
    action(message)();
    resolve();
  });
};
