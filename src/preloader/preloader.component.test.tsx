import React from 'react';
import Preloader, {
  Preloader as UnconnectedPreloader,
} from './preloader.component';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';
import { shallow } from 'enzyme';

describe('Preloader component', () => {
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: {
        action: 'POP',
        location: createLocation('/'),
      },
    };
    mockStore = configureStore();
  });

  it('renders fullscreen correctly', () => {
    state.scigateway.siteLoading = true;

    const wrapper = shallow(
      <Preloader store={mockStore(state)} fullScreen={true} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders not fullscreen correctly', () => {
    const wrapper = shallow(
      <UnconnectedPreloader loading={true} fullScreen={false} />
    );
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
