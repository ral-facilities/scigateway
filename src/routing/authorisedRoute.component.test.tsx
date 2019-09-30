import React from 'react';
import withAuth from './authorisedRoute.component';
import { createShallow } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';
import TestAuthProvider from '../authentication/testAuthProvider';
import LoadingAuthProvider from '../authentication/loadingAuthProvider';

describe('AuthorisedRoute component', () => {
  let shallow;
  let mockStore;
  let state: StateType;
  let ComponentToProtect = (): React.ReactElement => (
    <div>protected component</div>
  );

  beforeEach(() => {
    shallow = createShallow({});

    state = {
      scigateway: initialState,
      router: {
        action: 'POP',
        location: createLocation('/'),
      },
    };

    mockStore = configureStore();
  });

  it('renders component when user logged in', () => {
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );

    const AuthorisedComponent = withAuth(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders redirect when user not logged in', () => {
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider(null);

    const AuthorisedComponent = withAuth(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders nothing when site is loading due to LoadingAuthProvider', () => {
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new LoadingAuthProvider();

    const AuthorisedComponent = withAuth(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders nothing when site is loading due to loading prop', () => {
    state.scigateway.authorisation.loading = true;

    const AuthorisedComponent = withAuth(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper.dive()).toMatchSnapshot();
  });
});
