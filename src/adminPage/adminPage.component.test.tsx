import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { createLocation, createMemoryHistory, History } from 'history';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import AdminPage, {
  AdminPageProps,
  AdminPageWithStyles,
} from './adminPage.component';
import { Provider } from 'react-redux';
import { MuiThemeProvider } from '@material-ui/core';
import { buildTheme } from '../theming';
import TestAuthProvider from '../authentication/testAuthProvider';
import thunk from 'redux-thunk';
import { MemoryRouter, Router } from 'react-router';

import { PluginConfig } from '../state/scigateway.types';

describe('Admin page component', () => {
  let mount;
  let mockStore;
  let state: StateType;
  let props: AdminPageProps;
  let history: History;
  let dummyPlugins: PluginConfig[];

  beforeEach(() => {
    mount = createMount();
    mockStore = configureStore([thunk]);
    history = createMemoryHistory();

    dummyPlugins = [
      {
        order: 1,
        plugin: 'datagateway-download',
        link: '/admin/download',
        section: 'Admin',
        displayName: 'Admin Download',
        admin: true,
      },
    ];

    props = {
      plugins: dummyPlugins,
      adminPageDefaultTab: 'maintenance',
    };

    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/admin') },
    };
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
  });

  afterEach(() => {
    mount.cleanUp();
    jest.restoreAllMocks();
    jest.resetModules();
  });

  const theme = buildTheme(false);

  it('should render correctly', () => {
    const testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <MuiThemeProvider theme={theme}>
          <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
            <AdminPage />
          </MemoryRouter>
        </MuiThemeProvider>
      </Provider>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should render admin plugins correctly', () => {
    state.scigateway.plugins = [
      {
        order: 1,
        plugin: 'datagateway-download',
        link: '/admin/download',
        section: 'Admin',
        displayName: 'Admin Download',
        admin: true,
      },
    ];
    const testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <MuiThemeProvider theme={theme}>
          <MemoryRouter
            initialEntries={[{ key: 'testKey', pathname: '/admin/download' }]}
          >
            <AdminPage />
          </MemoryRouter>
        </MuiThemeProvider>
      </Provider>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('redirects to the tab when tab is clicked', () => {
    const testStore = mockStore(state);
    const history = createMemoryHistory();
    const wrapper = mount(
      <Provider store={testStore}>
        <MuiThemeProvider theme={theme}>
          <Router history={history}>
            <AdminPageWithStyles {...props} />
          </Router>
        </MuiThemeProvider>
      </Provider>
    );

    wrapper.find('#download-tab').last().simulate('click', { button: 0 });

    expect(history.location.pathname).toEqual('/admin/download');

    wrapper.find('#maintenance-tab').last().simulate('click', { button: 0 });

    expect(history.location.pathname).toEqual('/admin/maintenance');
  });

  it('redirects to the tab when tab is clicked', () => {
    const testStore = mockStore(state);

    mount(
      <Provider store={testStore}>
        <MuiThemeProvider theme={theme}>
          <Router history={history}>
            <AdminPageWithStyles {...props} />
          </Router>
        </MuiThemeProvider>
      </Provider>
    );

    history.push('/admin/download');

    expect(history.location.pathname).toEqual('/admin/download');
  });

  it('redirects to the tab when tab is clicked', () => {
    const testStore = mockStore(state);

    props = {
      plugins: dummyPlugins,
      adminPageDefaultTab: 'download',
    };

    mount(
      <Provider store={testStore}>
        <MuiThemeProvider theme={theme}>
          <Router history={history}>
            <AdminPageWithStyles {...props} />
          </Router>
        </MuiThemeProvider>
      </Provider>
    );

    history.push('/admin/maintenance');

    expect(history.location.pathname).toEqual('/admin/maintenance');
  });
});
