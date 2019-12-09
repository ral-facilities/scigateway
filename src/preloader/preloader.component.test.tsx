import React from 'react';
import Preloader from './preloader.component';
import { createShallow } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';

describe('Preloader component', () => {
  let shallow;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });

    state = {
      scigateway: initialState,
      router: {
        action: 'POP',
        location: createLocation('/'),
      },
    };
    mockStore = configureStore();
  });

  it('renders correctly', () => {
    state.scigateway.siteLoading = true;

    const wrapper = shallow(<Preloader store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render when on the login page', () => {
    state.router.location = createLocation('/login');

    const wrapper = shallow(<Preloader store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render when the site stops loading', () => {
    state.scigateway.siteLoading = false;

    const wrapper = shallow(<Preloader store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });
});
