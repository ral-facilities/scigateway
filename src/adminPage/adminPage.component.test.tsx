import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createLocation, createMemoryHistory, History } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import TestAuthProvider from '../authentication/testAuthProvider';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { PluginConfig } from '../state/scigateway.types';
import { StateType } from '../state/state.types';
import { buildTheme } from '../theming';
import AdminPage, { getAdminPluginRoutes } from './adminPage.component';

describe('Admin page component', () => {
  let mockStore;
  let state: StateType;
  let history: History;

  beforeEach(() => {
    mockStore = configureStore([thunk]);
    history = createMemoryHistory();

    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/') },
    };
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
  });

  const theme = buildTheme(false);

  function Wrapper({
    children,
  }: {
    children: React.ReactElement;
  }): JSX.Element {
    const testStore = mockStore(state);
    return (
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <Router history={history}>{children}</Router>
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render maintenance page correctly', () => {
    state.scigateway.adminPageDefaultTab = 'download';
    state.scigateway.plugins = [
      ...state.scigateway.plugins,
      {
        order: 1,
        plugin: 'datagateway-download',
        link: '/admin/download',
        section: 'Admin',
        displayName: 'Admin Download',
        admin: true,
      },
    ];
    history.replace('/admin/maintenance');

    render(<AdminPage />, { wrapper: Wrapper });

    expect(
      screen.getByRole('heading', { name: 'admin.title' })
    ).toBeInTheDocument();
    expect(screen.getByRole('tablist'));
    expect(
      screen.getByRole('tab', { name: 'Maintenance' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Admin Download' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tabpanel', { name: 'Maintenance' })
    ).toBeInTheDocument();
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
    state.scigateway.adminPageDefaultTab = 'maintenance';
    history.replace('/admin/download');

    render(<AdminPage />, { wrapper: Wrapper });

    expect(
      screen.getByRole('heading', { name: 'admin.title' })
    ).toBeInTheDocument();
    expect(screen.getByRole('tablist'));
    expect(
      screen.getByRole('tab', { name: 'Maintenance' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Admin Download' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tabpanel', { name: 'Admin Download' })
    ).toBeInTheDocument();
  });

  it('redirects to the tab when tab is clicked', async () => {
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
    history.replace('/admin/maintenance');
    const user = userEvent.setup();

    render(<AdminPage />, { wrapper: Wrapper });

    await user.click(screen.getByRole('tab', { name: 'Admin Download' }));
    expect(history.location.pathname).toEqual('/admin/download');
    expect(
      screen.getByRole('tabpanel', { name: 'Admin Download' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Maintenance' }));
    expect(history.location.pathname).toEqual('/admin/maintenance');
    expect(
      await screen.findByRole('tabpanel', { name: 'Maintenance' })
    ).toBeInTheDocument();
  });

  it('should return an empty object when given an empty plugins array', () => {
    const plugins = [];
    const result = getAdminPluginRoutes({ plugins });
    expect(result).toEqual({});
  });

  it('should correctly filter and group plugin routes for admin users', () => {
    const plugins: PluginConfig[] = [
      {
        plugin: 'PluginA',
        admin: true,
        link: '/admin/pluginA',
        section: 'A',
        displayName: 'A',
        order: 1,
      },
      {
        plugin: 'PluginA',
        admin: true,
        link: '/admin/pluginA2',
        section: 'A',
        displayName: 'A2',
        order: 2,
      },
      {
        plugin: 'PluginB',
        admin: false,
        link: '/public/pluginB',
        section: 'B',
        displayName: 'B',
        order: 3,
      },
    ];
    const result = getAdminPluginRoutes({ plugins }); // Admin user
    expect(result).toEqual({
      PluginA: { pluginA: '/admin/pluginA', pluginA2: '/admin/pluginA2' },
    });
  });

  it('should correctly filter and group plugin routes for non-admin users', () => {
    const plugins: PluginConfig[] = [
      {
        plugin: 'PluginA',
        admin: true,
        link: '/admin/pluginALink',
        section: 'A',
        displayName: 'A',
        order: 1,
      },
      {
        plugin: 'PluginB',
        admin: false,
        link: '/public/pluginBLink',
        section: 'B',
        displayName: 'B',
        order: 2,
      },
    ];
    const result = getAdminPluginRoutes({ plugins }); // Non-admin user
    expect(result).toEqual({
      PluginA: {
        pluginALink: '/admin/pluginALink',
      },
    });
  });
});
