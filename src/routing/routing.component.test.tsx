import React from 'react';
import Routing, { PluginPlaceHolder } from './routing.component';
import { mount, shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import TestAuthProvider from '../authentication/testAuthProvider';
import * as singleSpa from 'single-spa';
import { ThemeProvider } from '@emotion/react';
import { buildTheme } from '../theming';

jest.mock('../adminPage/adminPage.component', () => () => 'Mocked AdminPage');
jest.mock(
  '../maintenancePage/maintenancePage.component',
  () => () => 'Mocked MaintenancePage'
);
jest.mock('../preloader/preloader.component', () => ({
  Preloader: () => 'Mocked Preloader',
}));
jest.mock('single-spa', () => ({
  unloadApplication: jest.fn(),
}));

describe('Routing component', () => {
  let mockStore;
  let state: StateType;
  const theme = buildTheme(false);

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

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('renders component with no plugin routes', () => {
    state.scigateway.plugins = [];
    const wrapper = shallow(<Routing store={mockStore(state)} />)
      .dive()
      .dive();

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
        section: 'test section',
        link: 'test link alt',
        plugin: 'test_plugin_name',
        displayName: 'Test Plugin Alt link',
        order: 2,
      },
      {
        section: 'test section 2',
        link: 'test link 2',
        plugin: 'test_plugin_name_2',
        displayName: 'Test Plugin 2',
        order: 3,
      },
      {
        section: 'test section',
        link: 'test link admin',
        plugin: 'test_plugin_name',
        displayName: 'Test Plugin Admin',
        admin: true,
        order: 4,
      },
      {
        section: 'test section',
        link: 'test link admin alt',
        plugin: 'test_plugin_name',
        displayName: 'Test Plugin Admin Alt link',
        admin: true,
        order: 5,
      },
    ];
    const wrapper = shallow(<Routing store={mockStore(state)} />)
      .dive()
      .dive();

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
          <ThemeProvider theme={theme}>
            <Routing />
          </ThemeProvider>
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
          <ThemeProvider theme={theme}>
            <Routing />
          </ThemeProvider>
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
          <ThemeProvider theme={theme}>
            <Routing />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('redirects to a homepage URL if specified', () => {
    state.scigateway.homepageUrl = '/homepage';

    const wrapper = shallow(<Routing store={mockStore(state)} />)
      .dive()
      .dive();

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

    const wrapper = shallow(<Routing store={mockStore(state)} />)
      .dive()
      .dive();

    expect(wrapper).toMatchSnapshot();
  });

  it('single-spa remounts a plugin when switching between admin and non-admin plugins via single-spa:before-no-app-change event', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider('logged in');
    state.scigateway.siteLoading = false;
    state.scigateway.plugins = [
      {
        section: 'test section',
        link: '/test_link',
        plugin: 'test_plugin_name',
        displayName: 'Test Plugin',
        order: 1,
      },
      {
        section: 'test section',
        link: '/admin_test_link',
        plugin: 'test_plugin_name',
        displayName: 'Test Plugin Admin',
        admin: true,
        order: 2,
      },
    ];
    mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter initialEntries={['/test_link']}>
          <Routing />
        </MemoryRouter>
      </Provider>
    );

    window.dispatchEvent(
      new CustomEvent('single-spa:before-no-app-change', {
        detail: {
          oldUrl: 'http://localhost/test_link',
          newUrl: 'http://localhost/admin_test_link',
        },
      })
    );
    expect(singleSpa.unloadApplication).toHaveBeenCalledWith(
      'test_plugin_name'
    );

    (singleSpa.unloadApplication as jest.Mock).mockClear();

    window.dispatchEvent(
      new CustomEvent('single-spa:before-no-app-change', {
        detail: {
          oldUrl: 'http://localhost/admin_test_link',
          newUrl: 'http://localhost/test_link',
        },
      })
    );
    expect(singleSpa.unloadApplication).toHaveBeenCalledWith(
      'test_plugin_name'
    );
  });

  it("single-spa reloads a plugin when it hasn't loaded for some reason", () => {
    jest.useFakeTimers();
    state.scigateway.authorisation.provider = new TestAuthProvider('logged in');
    state.scigateway.siteLoading = false;
    state.scigateway.plugins = [
      {
        section: 'test section',
        link: '/test_link',
        plugin: 'test_plugin_name',
        displayName: 'Test Plugin',
        order: 1,
      },
    ];
    state.router.location = createLocation('/test_link');

    jest.spyOn(document, 'getElementById').mockImplementation(() => {
      return document.createElement('div');
    });

    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

    mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter initialEntries={['/test_link']}>
          <Routing />
        </MemoryRouter>
      </Provider>
    );
    jest.runAllTimers();

    expect(singleSpa.unloadApplication).toHaveBeenCalledWith(
      'test_plugin_name'
    );

    expect(clearIntervalSpy).toHaveBeenCalledWith(expect.any(Number));
  });
});
