import React from 'react';
import ExampleComponent from './example.component';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import { authState, initialState } from './state/reducers/scigateway.reducer';
import { StateType } from './state/state.types';

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

    const wrapper = shallow(<ExampleComponent store={mockStore(state)} />)
      .dive()
      .dive();
    expect(wrapper).toMatchSnapshot();
  });
});
