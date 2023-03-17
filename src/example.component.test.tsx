import React from 'react';
import ExampleComponent from './example.component';
import configureStore from 'redux-mock-store';
import { authState, initialState } from './state/reducers/scigateway.reducer';
import { StateType } from './state/state.types';
import { render } from '@testing-library/react';

describe('Example component', () => {
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    mockStore = configureStore();
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
    };
  });

  it('renders correctly', () => {
    // update the notification
    state.scigateway.notifications = ['test notification'];

    const { asFragment } = render(
      <ExampleComponent store={mockStore(state)} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
