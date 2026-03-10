import { ThemeProvider, useMediaQuery } from '@mui/material';
import { act, render } from '@testing-library/react';
import { MemoryHistory, createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore, { MockStoreCreator } from 'redux-mock-store';
import * as singleSpa from 'single-spa';
import NullAuthProvider from '../authentication/nullAuthProvider';
import TestAuthProvider from '../authentication/testAuthProvider';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { StateType } from '../state/state.types';
import { buildTheme } from '../theming';
import Routing, { PluginPlaceHolder } from './routing.component';

vi.mock('../adminPage/adminPage.component', () => ({
  default: () => 'Mocked AdminPage',
}));
vi.mock('../maintenancePage/maintenancePage.component', () => ({
  default: () => 'Mocked MaintenancePage',
}));
vi.mock('../preloader/preloader.component', () => ({
  Preloader: () => 'Mocked Preloader',
}));
vi.mock('@mui/material', async () => ({
  __esmodule: true,
  ...(await vi.importActual('@mui/material')),
  useMediaQuery: vi.fn(),
}));

describe('Routing component', () => {
  let mockStore: MockStoreCreator;
  let history: MemoryHistory;
  let state: StateType;

  function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
    return (
      <ThemeProvider theme={buildTheme(false)}>
        <Router history={history}>
          <Provider store={mockStore(state)}>{children}</Provider>
        </Router>
      </ThemeProvider>
    );
  }

  let storageGetItemSpy = vi.spyOn(Storage.prototype, 'getItem');

  beforeEach(() => {
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
    };
    storageGetItemSpy = vi.spyOn(Storage.prototype, 'getItem');

    history = createMemoryHistory();
    mockStore = configureStore();

    // I don't think MediaQuery works properly in jest
    // in the implementation useMediaQuery is used to query whether the current viewport is md or larger
    // here we assume it is always the case.
    vi.mocked(useMediaQuery).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
    storageGetItemSpy.mockRestore();
  });

  it('renders component with no plugin routes', () => {
    state.scigateway.plugins = [];

    const { asFragment } = render(<Routing />, { wrapper: Wrapper });

    expect(asFragment()).toMatchSnapshot();
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
      {
        section: 'test section',
        link: 'test link not authorised',
        plugin: 'test_plugin_name',
        displayName: 'Test Plugin Not Authorised',
        unauthorised: true,
        order: 6,
      },
    ];

    const { asFragment } = render(<Routing />, { wrapper: Wrapper });

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders an unauthorised route for a plugin', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
    state.scigateway.plugins = [
      {
        section: 'test section',
        link: 'test link',
        plugin: 'test_plugin_name',
        displayName: 'Test Plugin',
        unauthorised: true,
        order: 1,
      },
    ];

    const { asFragment } = render(<Routing />, { wrapper: Wrapper });

    expect(asFragment()).toMatchSnapshot();
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

    history.replace('/test_link');

    const { asFragment } = render(<Routing />, { wrapper: Wrapper });

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders a route for maintenance page when site is under maintenance and user is not admin', () => {
    const testAuthProvider = new TestAuthProvider('logged in');
    testAuthProvider.isAdmin = vi.fn().mockImplementationOnce(() => false);
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
    history.replace('/test_link');

    const { asFragment } = render(<Routing />, { wrapper: Wrapper });

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders placeholder for a plugin', () => {
    const { asFragment } = render(<PluginPlaceHolder id="test_id" />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders a route for admin page', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider('logged in');
    state.scigateway.siteLoading = false;

    history.replace('/admin');

    const { asFragment } = render(<Routing />, { wrapper: Wrapper });

    expect(asFragment()).toMatchSnapshot();
  });

  it('redirects to a homepage URL if specified', () => {
    state.scigateway.homepageUrl = '/homepage';

    render(<Routing />, { wrapper: Wrapper });

    expect(history.location.pathname).toEqual('/homepage');
  });

  it('redirects to the homepage if navigating to login page while logged in', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider('logged in');

    state.scigateway.authorisation.provider.autoLogin = vi
      .fn()
      .mockImplementationOnce(() => Promise.reject());

    storageGetItemSpy.mockImplementation((name) =>
      name === 'autoLogin' ? 'false' : null
    );

    const { asFragment } = render(<Routing />, { wrapper: Wrapper });

    expect(asFragment()).toMatchSnapshot();
  });

  it('redirects to referrer on /login route when auto-logged when referred by authorisedRoute', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
    state.scigateway.siteLoading = false;

    history.replace({
      pathname: '/login',
      state: {
        referrer: '/test',
        referredFrom: 'authorisedRoute',
      },
    });

    const { rerender } = render(<Routing />, { wrapper: Wrapper });

    state.scigateway.authorisation.provider = new TestAuthProvider('logged in');
    state.scigateway.authorisation.provider.autoLogin = vi
      .fn()
      .mockImplementation(() => Promise.resolve());

    storageGetItemSpy.mockImplementation((name) =>
      name === 'autoLogin' ? 'true' : null
    );

    rerender(<Routing />);

    expect(history.location.pathname).toEqual('/test');
  });

  it('redirects to / on /login route when logged in after auto-logged in (no referrer)', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider('logged in');
    state.scigateway.authorisation.provider.autoLogin = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    let isAutoLoggedIn = 'true';
    storageGetItemSpy.mockImplementation((name) =>
      name === 'autoLogin' ? isAutoLoggedIn : null
    );

    history.replace('/login');

    const { rerender } = render(<Routing />, { wrapper: Wrapper });

    expect(history.location.pathname).toEqual('/login');

    // simulate logging in - probably not needed for this unit test but it changes the token etc.
    state.scigateway.authorisation.provider.logIn('username', 'password');
    // no longer auto-logged in so change what localStorage returns
    isAutoLoggedIn = 'false';

    rerender(<Routing />);

    expect(history.location.pathname).toEqual('/');
  });

  it('renders /login page when navigating to login page when auto-logged in', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider('logged in');
    state.scigateway.siteLoading = false;

    state.scigateway.authorisation.provider.autoLogin = vi
      .fn()
      .mockImplementation(() => Promise.resolve());

    storageGetItemSpy.mockImplementation((name) =>
      name === 'autoLogin' ? 'true' : null
    );

    history.replace('/login');
    render(<Routing />, { wrapper: Wrapper });

    expect(history.location.pathname).toEqual('/login');
  });

  it('renders /login page when navigating to logout page when auto-logged in', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider('logged in');
    state.scigateway.siteLoading = false;

    state.scigateway.authorisation.provider.autoLogin = vi
      .fn()
      .mockImplementation(() => Promise.resolve());

    storageGetItemSpy.mockImplementation((name) =>
      name === 'autoLogin' ? 'true' : null
    );

    history.replace('/logout');
    render(<Routing />, { wrapper: Wrapper });

    expect(history.location.pathname).toEqual('/login');
  });

  it('redirects to / if navigating to login or logout page while using nullAuthProvider', () => {
    state.scigateway.authorisation.provider = new NullAuthProvider();
    render(<Routing />, { wrapper: Wrapper });
    expect(history.location.pathname).toEqual('/');

    act(() => {
      history.replace('/login');
    });
    expect(history.location.pathname).toEqual('/');

    act(() => {
      history.replace('/logout');
    });
    expect(history.location.pathname).toEqual('/');
  });

  it('redirects to referrer on /login route after login when referrer is provided', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
    state.scigateway.siteLoading = false;

    history.replace({
      pathname: '/login',
      state: {
        referrer: '/test',
      },
    });

    const { rerender } = render(<Routing />, { wrapper: Wrapper });

    state.scigateway.authorisation.provider = new TestAuthProvider('logged in');
    rerender(<Routing />);

    expect(history.location.pathname).toEqual('/test');
  });

  it('redirects to referrer on /login route after login when referrer is provided via session storage', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
    state.scigateway.siteLoading = false;

    history.replace('/login');

    storageGetItemSpy.mockImplementation((name) =>
      name === 'referrer' ? '/test' : null
    );

    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

    const { rerender } = render(<Routing />, { wrapper: Wrapper });

    state.scigateway.authorisation.provider = new TestAuthProvider('logged in');
    rerender(<Routing />);

    expect(history.location.pathname).toEqual('/test');
    expect(removeItemSpy).toHaveBeenCalledWith('referrer');
  });

  it('redirects to / on /login route after login when referrer is not provided', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
    state.scigateway.siteLoading = false;

    history.replace('/login');
    const { rerender } = render(<Routing />, { wrapper: Wrapper });

    state.scigateway.authorisation.provider = new TestAuthProvider('logged in');

    rerender(<Routing />);

    expect(history.location.pathname).toEqual('/');
  });

  it('redirects to /logout on /login route when /login is accessed not after login', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider('logged in');
    state.scigateway.siteLoading = false;

    history.replace('/login');
    render(<Routing />, { wrapper: Wrapper });

    expect(history.location.pathname).toEqual('/logout');
  });

  it("single-spa reloads a plugin when it hasn't loaded for some reason", () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
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
    history.replace('/test_link');
    const unloadApplicationSpy = vi.spyOn(singleSpa, 'unloadApplication');

    vi.spyOn(document, 'getElementById').mockImplementation(() => {
      return document.createElement('div');
    });

    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

    render(<Routing />, { wrapper: Wrapper });

    vi.runAllTimers();

    expect(unloadApplicationSpy).toHaveBeenCalledWith('test_plugin_name');

    // Could not use toHaveBeenCalledWith(expect.any(Number)) as it is a mocked object in this test
    expect(clearIntervalSpy).toHaveBeenCalled();

    // restore clearInterval to avoid errors with it not being a function on unmount
    clearIntervalSpy.mockRestore();
    vi.useRealTimers();
  });

  it("single-spa doesn't reload a plugin when it has been loaded", () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
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
    history.replace('/test_link');
    const unloadApplicationSpy = vi.spyOn(singleSpa, 'unloadApplication');

    vi.spyOn(document, 'getElementById').mockImplementation((element) => {
      if (element === 'plugin-preloader') return null; // simulate loaded plugin
      return document.createElement('div');
    });

    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

    render(<Routing />, { wrapper: Wrapper });

    vi.runAllTimers();

    expect(unloadApplicationSpy).not.toHaveBeenCalled();

    // Could not use toHaveBeenCalledWith(expect.any(Number)) as it is a mocked object in this test
    expect(clearIntervalSpy).toHaveBeenCalled();

    // restore clearInterval to avoid errors with it not being a function on unmount
    clearIntervalSpy.mockRestore();
    vi.useRealTimers();
  });
});
