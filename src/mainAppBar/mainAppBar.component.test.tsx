import React from 'react';
import MainAppBarComponent from './mainAppBar.component';
import { createLocation, createMemoryHistory, History } from 'history';
import { StateType } from '../state/state.types';
import { PluginConfig } from '../state/scigateway.types';
import configureStore, { MockStore } from 'redux-mock-store';
import { push } from 'connected-react-router';
import { initialState } from '../state/reducers/scigateway.reducer';
import {
  loadDarkModePreference,
  loadHighContrastModePreference,
  toggleDrawer,
  toggleHelp,
} from '../state/actions/scigateway.actions';
import { Provider } from 'react-redux';
import TestAuthProvider from '../authentication/testAuthProvider';
import { buildTheme } from '../theming';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { Router } from 'react-router-dom';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMediaQuery } from '@mui/material';

vi.mock('@mui/material', () => ({
  __esmodule: true,
  ...jest.requireActual('@mui/material'),
  useMediaQuery: vi.fn(),
}));

describe('Main app bar component', () => {
  let testStore: MockStore;
  let state: StateType;
  let history: History;

  function Wrapper({
    children,
  }: {
    children: React.ReactElement;
  }): JSX.Element {
    return (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={testStore}>
            <Router history={history}>{children}</Router>
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  }

  beforeEach(() => {
    history = createMemoryHistory();

    state = {
      scigateway: {
        ...initialState,
        logo: 'logo_url',
        features: { ...initialState.features, showHelpPageButton: true },
      },
      router: { location: createLocation('/') },
    };
    state.scigateway.authorisation.provider = new TestAuthProvider('token123');

    testStore = configureStore()(state);

    // I don't think MediaQuery works properly in jest
    // in the implementation useMediaQuery is used to query whether the current viewport is md or larger
    // here we assume it is always the case.
    vi.mocked(useMediaQuery).mockReturnValue(true);
  });

  const theme = buildTheme(false);

  it('app bar renders correctly', () => {
    render(<MainAppBarComponent />, { wrapper: Wrapper });

    expect(
      screen.getByRole('button', { name: 'open-navigation-menu' })
    ).toBeInTheDocument();

    const titleButton = screen.getByRole('button', { name: 'home-page' });
    expect(titleButton).toBeInTheDocument();
    expect(within(titleButton).getByRole('img')).toHaveAttribute(
      'src',
      'logo_url'
    );
    expect(
      screen.getByRole('button', { name: 'help-page' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'admin-page' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'help' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'open-browser-settings' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open notification menu' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('NotificationsIcon')).toBeInTheDocument();

    // mobile overflow menu item should be hidden
    expect(
      screen.queryByRole('button', { name: 'open-mobile-menu' })
    ).not.toBeInTheDocument();
  });

  it('does not render Help button when feature is false', () => {
    state.scigateway.features.showHelpPageButton = false;

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    expect(screen.queryByRole('button', { name: 'help-page' })).toBeNull();
  });

  it('uses single plugin logo when feature is true', async () => {
    state.scigateway.logo = undefined;
    state.scigateway.siteLoading = false;
    state.scigateway.features.singlePluginLogo = true;
    state.scigateway.plugins = [
      {
        order: 0,
        section: 'plugin',
        plugin: 'plugin',
        link: '/plugin',
        displayName: 'Plugin',
        logoDarkMode: 'plugin_logo_dark',
      },
    ];

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(
        within(screen.getByRole('button', { name: 'home-page' })).getByRole(
          'img'
        )
      ).toHaveAttribute('src', 'plugin_logo_dark');
    });
  });

  it('shows close drawer button when drawer is open', () => {
    state.scigateway.drawerOpen = true;

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    expect(screen.getByRole('button', { name: 'close-navigation-menu' }));
  });

  it('sends toggleDrawer action when site has loaded', () => {
    state.scigateway.drawerOpen = false;
    state.scigateway.siteLoading = false;

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleDrawer());
  });

  it('sends toggleDrawer action when menu clicked (open drawer)', async () => {
    const user = userEvent.setup();
    state.scigateway.drawerOpen = true;

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    await user.click(
      screen.getByRole('button', { name: 'close-navigation-menu' })
    );

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleDrawer());
  });

  it('sends toggleDrawer action when menu clicked (close drawer)', async () => {
    const user = userEvent.setup();

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    await user.click(
      screen.getByRole('button', { name: 'open-navigation-menu' })
    );

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleDrawer());
  });

  it('redirects to base url when title clicked', async () => {
    const user = userEvent.setup();

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'home-page' }));

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/'));
  });

  it('redirects to Help page when Help button clicked', async () => {
    const user = userEvent.setup();

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'help-page' }));

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/help'));
  });

  it('redirects to Admin page when Admin button clicked (maintenance is default)', async () => {
    const user = userEvent.setup();

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'admin-page' }));

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/admin/maintenance'));
  });

  it('redirects to Admin page when Admin button clicked (download is default)', async () => {
    state.scigateway.adminPageDefaultTab = 'download';
    const user = userEvent.setup();

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'admin-page' }));

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/admin/download'));
  });

  it('sends toggleHelp action when help button is clicked', async () => {
    const user = userEvent.setup();

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    await user.click(await screen.findByRole('button', { name: 'help' }));

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleHelp());
  });

  it('opens settings when button clicked', async () => {
    const user = userEvent.setup();

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    expect(screen.queryByRole('menu')).toBeNull();

    await user.click(
      screen.getByRole('button', { name: 'open-browser-settings' })
    );

    const settingsMenu = await screen.findByRole('menu');

    expect(settingsMenu).toBeInTheDocument();
    expect(
      within(settingsMenu).getByRole('menuitem', {
        name: 'manage-cookies-button',
      })
    ).toBeInTheDocument();
    expect(
      within(settingsMenu).getByRole('menuitem', {
        name: 'switch-dark-mode',
      })
    ).toBeInTheDocument();
    expect(
      within(settingsMenu).getByRole('menuitem', {
        name: 'switch-high-contrast-on',
      })
    ).toBeInTheDocument();
  });

  it('settings display correctly when dark and high contrast modes are enabled', async () => {
    state.scigateway.darkMode = true;
    state.scigateway.highContrastMode = true;
    const user = userEvent.setup();

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    await user.click(
      screen.getByRole('button', { name: 'open-browser-settings' })
    );

    const settingsMenu = await screen.findByRole('menu');

    expect(settingsMenu).toBeInTheDocument();
    expect(
      within(settingsMenu).getByRole('menuitem', {
        name: 'manage-cookies-button',
      })
    ).toBeInTheDocument();
    expect(
      within(settingsMenu).getByRole('menuitem', {
        name: 'switch-light-mode',
      })
    ).toBeInTheDocument();
    expect(
      within(settingsMenu).getByRole('menuitem', {
        name: 'switch-high-contrast-off',
      })
    ).toBeInTheDocument();
  });

  it('opens cookie policy/management page if manage cookies clicked', async () => {
    const user = userEvent.setup();

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    // Click the user menu button and click on the manage cookies menu item.
    await user.click(
      screen.getByRole('button', { name: 'open-browser-settings' })
    );
    await user.click(
      await screen.findByRole('menuitem', { name: 'manage-cookies-button' })
    );

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/cookies'));
  });

  it('sends load dark mode preference action if toggle dark mode is clicked', async () => {
    const user = userEvent.setup();

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    // Click the user menu button and click on the manage cookies menu item.
    await user.click(
      screen.getByRole('button', { name: 'open-browser-settings' })
    );
    await user.click(
      await screen.findByRole('menuitem', { name: 'switch-dark-mode' })
    );

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(loadDarkModePreference(true));
  });

  it('sends load high contrast mode preference action if toggle high contrast mode is clicked', async () => {
    const user = userEvent.setup();

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    // Click the user menu button and click on the manage cookies menu item.
    await user.click(
      screen.getByRole('button', { name: 'open-browser-settings' })
    );
    await user.click(
      await screen.findByRole('menuitem', { name: 'switch-high-contrast-on' })
    );

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(
      loadHighContrastModePreference(true)
    );
  });

  it('sets plugin logo', async () => {
    const plugin: PluginConfig = {
      section: 'section',
      link: '/link',
      plugin: 'plugin',
      displayName: 'pluginName',
      order: 1,
      logoDarkMode: 'pluginLogo',
    };
    delete state.scigateway.logo;
    state.scigateway.plugins = [plugin];
    state.scigateway.siteLoading = false;

    // Need to attachTo something to ensure document.getElementById works as expected
    // https://stackoverflow.com/questions/43694975/jest-enzyme-using-mount-document-getelementbyid-returns-null-on-componen
    const holder = document.createElement('div');
    document.body.appendChild(holder);
    render(
      <div id="plugin">
        <MainAppBarComponent />
      </div>,
      { wrapper: Wrapper, container: holder }
    );

    expect(await screen.findByRole('img')).toHaveAttribute('src', 'pluginLogo');
  });

  it('sets scigateway logo if no plugin is matched', () => {
    const plugin: PluginConfig = {
      section: 'section',
      link: '/link',
      plugin: 'plugin1',
      displayName: 'pluginName',
      order: 1,
      logoDarkMode: 'pluginLogo',
    };
    state.scigateway.plugins = [plugin];

    render(
      <div id="plugin2">
        <MainAppBarComponent />
      </div>,
      { wrapper: Wrapper }
    );

    expect(screen.getByRole('img')).toHaveAttribute('src', 'logo_url');
  });

  it('sets scigateway logo if plugin does not provide a logo', () => {
    const plugin = {
      section: 'section',
      link: '/link',
      plugin: 'plugin',
      displayName: 'pluginName',
      order: 1,
    };
    state.scigateway.plugins = [plugin];

    render(
      <div id="plugin2">
        <MainAppBarComponent />
      </div>,
      { wrapper: Wrapper }
    );

    expect(screen.getByRole('img')).toHaveAttribute('src', 'logo_url');
  });

  it('opens no notifications message if alert icon clicked and there are no alerts', async () => {
    const user = userEvent.setup();

    render(<MainAppBarComponent />, { wrapper: Wrapper });

    expect(screen.queryByLabelText('No notifications message')).toBeNull();

    await user.click(
      screen.getByRole('button', { name: 'Open notification menu' })
    );

    expect(
      await screen.findByLabelText('No notifications message')
    ).toBeInTheDocument();
  });

  describe('mobile variant', () => {
    beforeEach(() => {
      vi.mocked(useMediaQuery).mockReturnValue(false);
    });

    it('shows drawer button, logo, user avatar, notification button, and an overflow menu button', () => {
      render(<MainAppBarComponent />, { wrapper: Wrapper });

      expect(
        screen.getByRole('button', { name: 'open-navigation-menu' })
      ).toBeInTheDocument();

      const titleButton = screen.getByRole('button', { name: 'home-page' });
      expect(titleButton).toBeInTheDocument();
      expect(within(titleButton).getByRole('img')).toHaveAttribute(
        'src',
        'logo_url'
      );

      expect(
        screen.queryByRole('button', { name: 'help-page' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'admin-page' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'help' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'open-browser-settings' })
      ).not.toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: 'Open notification menu' })
      ).toBeInTheDocument();
      expect(screen.queryByTestId('NotificationsIcon')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Open user menu' })
      ).toBeInTheDocument();
      // mobile overflow menu item should be visible
      expect(
        screen.getByRole('button', { name: 'open-mobile-menu' })
      ).toBeInTheDocument();
    });

    it('opens mobile overflow menu when overflow menu button is clicked', async () => {
      const user = userEvent.setup();

      render(<MainAppBarComponent />, { wrapper: Wrapper });

      await user.click(
        screen.getByRole('button', { name: 'open-mobile-menu' })
      );

      // TestAuthProvider provides an admin account, so admin page button should be visible
      expect(
        screen.getByRole('menuitem', { name: 'admin-page' })
      ).toBeInTheDocument();
      // help page is enabled by default
      expect(
        screen.getByRole('menuitem', { name: 'help-page' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: 'tutorial' })
      ).toBeInTheDocument();

      expect(
        screen.getByRole('menuitem', { name: 'manage-cookies-button' })
      ).toBeInTheDocument();
      // dark mode is off by default
      expect(
        screen.getByRole('menuitem', { name: 'switch-dark-mode' })
      ).toBeInTheDocument();
      // high contrast mode is off by default
      expect(
        screen.getByRole('menuitem', { name: 'switch-high-contrast-on' })
      ).toBeInTheDocument();
    });
  });
});
