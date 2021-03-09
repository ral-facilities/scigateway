import React from 'react';
import withAuth from './authorisedRoute.component';
import { createShallow } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';
import TestAuthProvider from '../authentication/testAuthProvider';
import LoadingAuthProvider from '../authentication/loadingAuthProvider';
import {
  invalidToken,
  requestPluginRerender,
} from '../state/actions/scigateway.actions';
import { flushPromises } from '../setupTests';

describe('AuthorisedRoute component', () => {
  let shallow;
  let mockStore;
  let state: StateType;
  const ComponentToProtect = (): React.ReactElement => (
    <div>protected component</div>
  );

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

  it('renders component when user logged in', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );

    const AuthorisedComponent = withAuth(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders redirect when startUrl is configured and logged in', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );
    state.router.location.state = { scigateway: { startUrl: '/test' } };

    const AuthorisedComponent = withAuth(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders redirect when user not logged in', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider(null);

    const AuthorisedComponent = withAuth(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders nothing when site is loading due to LoadingAuthProvider', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new LoadingAuthProvider();

    const AuthorisedComponent = withAuth(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders nothing when site is loading due to loading prop', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = true;

    const AuthorisedComponent = withAuth(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders nothing when site is loading due to siteLoading prop', () => {
    state.scigateway.siteLoading = true;

    const AuthorisedComponent = withAuth(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('dispatches requestPluginRerender action when loading or logged in state changes', () => {
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );

    const testStore = mockStore(state);

    const AuthorisedComponent = withAuth(ComponentToProtect);
    const wrapper = shallow(<AuthorisedComponent store={testStore} />);

    wrapper.setProps({ loading: false });
    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(requestPluginRerender());

    testStore.clearActions();
    wrapper.setProps({ loggedIn: false });
    wrapper.setProps({ loggedIn: true });

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(requestPluginRerender());
  });

  it('dispatches invalidToken when token fails verification', async () => {
    const testAuthProvider = new TestAuthProvider('token');

    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = testAuthProvider;

    const testStore = mockStore(state);
    const AuthorisedComponent = withAuth(ComponentToProtect);
    shallow(<AuthorisedComponent store={testStore} />);

    await flushPromises();

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(invalidToken());
  });
});
