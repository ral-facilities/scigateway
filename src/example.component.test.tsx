import React from 'react';
import ExampleComponent from './example.component';
import { createShallow } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import { initialState } from './state/reducers/scigateway.reducer';
import { StateType } from './state/state.types';

describe('Example component', () => {
  let shallow;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({});

    mockStore = configureStore();
    state = {
      scigateway: initialState,
    };
  });

  it('renders correctly', () => {
    // update the notification
    state.scigateway.notifications = ['test notification'];

    const wrapper = shallow(<ExampleComponent store={mockStore(state)} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
