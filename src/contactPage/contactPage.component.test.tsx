import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import ContactPage from './contactPage.component';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';

describe('Contact page componet', () => {
  let shallow;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'ContactPage' });

    mockStore = configureStore();
    state = JSON.parse(
      JSON.stringify({
        scigateway: initialState,
        router: { location: createLocation('/contact') },
      })
    );
  });

  it('should render correctly', () => {
    const wrapper = shallow(<ContactPage store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });
});
