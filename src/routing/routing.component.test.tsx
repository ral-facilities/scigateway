import React from 'react';
import Routing, { PluginPlaceHolder } from './routing.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import TestAuthProvider from '../authentication/testAuthProvider';

// this removes a lot of unnecessary styling information in the snapshots
jest.mock('@material-ui/core/styles', () => ({
  withStyles: (styles) => (component) => component,
  makeStyles: (styles) => (component) => component,
}));
// Need to return something to avoid errors, use aria-label to ensure
// correct components are being rendered in the snapshot
jest.mock('../adminPage/adminPage.component', () => {
  return {
    __esModule: true,
    // eslint-disable-next-line react/display-name
    default: () => {
      return <div aria-label="AdminPage"></div>;
    },
  };
});
jest.mock('../maintenancePage/maintenancePage.component', () => {
  return {
    __esModule: true,
    // eslint-disable-next-line react/display-name
    default: () => {
      return <div aria-label="MaintenancePage"></div>;
    },
  };
});

describe('Routing component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  const classes = {
    container: 'container-class',
    containerShift: 'containerShift-class',
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();

    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: {
        action: 'POP',
        location: createLocation('/'),
      },
    };

    mockStore = configureStore();
  });

  it('renders component with no plugin routes', () => {
    state.scigateway.plugins = [];
    const wrapper = shallow(
      <Routing store={mockStore(state)} classes={classes} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders component with plugins', () => {
    state.scigateway.plugins = [
      {
        section: 'test section',
        link: 'test link',
        plugin: 'test_plugin_name',
        displayName: 'Test Plugin',
        order: 1,
      },
      {
        section: 'test section 2',
        link: 'test link 2',
        plugin: 'test_plugin_name_2',
        displayName: 'Test Plugin 2',
        order: 2,
      },
    ];
    const wrapper = shallow(
      <Routing store={mockStore(state)} classes={classes} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a route for a plugin when site is under maintenance and user is admin', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider('logged in');
    state.scigateway.siteLoading = false;
    state.scigateway.maintenance = { show: true, message: 'test' };
    state.scigateway.plugins = [
      {
        section: 'test section',
        link: '/test_link',
        plugin: 'test_plugin_name',
        displayName: 'Test Plugin',
        order: 1,
      },
    ];
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter
          initialEntries={[{ key: 'testKey', pathname: '/test_link' }]}
        >
          <Routing classes={classes} />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a route for maintenance page when site is under maintenance and user is not admin', () => {
    const testAuthProvider = new TestAuthProvider('logged in');
    testAuthProvider.isAdmin = jest.fn().mockImplementationOnce(() => false);
    state.scigateway.authorisation.provider = testAuthProvider;
    state.scigateway.siteLoading = false;
    state.scigateway.maintenance = { show: true, message: 'test' };
    state.scigateway.plugins = [
      {
        section: 'test section',
        link: '/test_link',
        plugin: 'test_plugin_name',
        displayName: 'Test Plugin',
        order: 1,
      },
    ];
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter
          initialEntries={[{ key: 'testKey', pathname: '/test_link' }]}
        >
          <Routing classes={classes} />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders placeholder for a plugin', () => {
    const wrapper = shallow(<PluginPlaceHolder id="test_id" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a route for admin page', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider('logged in');
    state.scigateway.siteLoading = false;
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter initialEntries={[{ key: 'testKey', pathname: '/admin' }]}>
          <Routing classes={classes} />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('redirects to a homepage URL if specified', () => {
    state.scigateway.homepageUrl = '/homepage';

    const wrapper = shallow(
      <Routing store={mockStore(state)} classes={classes} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('redirects to the homepage if navigating to login page while logged in', () => {
    state.scigateway.authorisation.provider.isLoggedIn = jest
      .fn()
      .mockImplementationOnce(() => true);

    state.scigateway.authorisation.provider.autoLogin = jest
      .fn()
      .mockImplementationOnce(() => Promise.reject());

    window.localStorage.__proto__.getItem = jest
      .fn()
      .mockImplementationOnce((name) =>
        name === 'autoLogin' ? 'false' : null
      );

    const wrapper = shallow(
      <Routing store={mockStore(state)} classes={classes} />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
