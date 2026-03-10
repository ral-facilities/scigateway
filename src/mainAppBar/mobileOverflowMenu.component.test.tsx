import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory, History } from 'history';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore, { MockStore } from 'redux-mock-store';
import TestAuthProvider, {
  NonAdminTestAuthProvider,
} from '../authentication/testAuthProvider';
import { toggleHelp } from '../state/actions/scigateway.actions';
import { initialState } from '../state/reducers/scigateway.reducer';
import { StateType } from '../state/state.types';
import { buildTheme } from '../theming';
import MobileOverflowMenu from './mobileOverflowMenu.component';

describe('Mobile overflow menu', () => {
  let testStore: MockStore;
  let state: StateType;
  let history: History;

  const theme = buildTheme(false);

  function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
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
      },
    };
    state.scigateway.authorisation.provider = new TestAuthProvider('token123');

    testStore = configureStore()(state);
  });

  it('combines app bar buttons and settings menu', () => {
    render(
      <MobileOverflowMenu open onClose={vi.fn()} anchorEl={document.body} />,
      {
        wrapper: Wrapper,
      }
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

  it('redirects to Admin page when Admin button clicked (maintenance is default)', async () => {
    const user = userEvent.setup();

    render(
      <MobileOverflowMenu open onClose={vi.fn()} anchorEl={document.body} />,
      {
        wrapper: Wrapper,
      }
    );

    await user.click(screen.getByRole('menuitem', { name: 'admin-page' }));

    expect(history.length).toEqual(2);
    expect(history.location.pathname).toEqual('/admin/maintenance');
  });

  it('redirects to Admin page when Admin button clicked (download is default)', async () => {
    state.scigateway.adminPageDefaultTab = 'download';
    state.scigateway.plugins = [
      ...state.scigateway.plugins,
      {
        section: 'Admin',
        link: '/admin/download',
        displayName: 'Admin Download',
        admin: true,
        order: 1,
        plugin: 'plugin',
      },
    ];
    const user = userEvent.setup();

    render(
      <MobileOverflowMenu open onClose={vi.fn()} anchorEl={document.body} />,
      {
        wrapper: Wrapper,
      }
    );

    await user.click(screen.getByRole('menuitem', { name: 'admin-page' }));

    expect(history.length).toEqual(2);
    expect(history.location.pathname).toEqual('/admin/download');
  });

  it('toggles tutorial help when tutorial menu item is clicked', async () => {
    const user = userEvent.setup();

    render(
      <MobileOverflowMenu open onClose={vi.fn()} anchorEl={document.body} />,
      {
        wrapper: Wrapper,
      }
    );

    await user.click(await screen.findByRole('menuitem', { name: 'tutorial' }));

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleHelp());
  });

  it('hides admin page item when logged in user is not an admin', () => {
    state.scigateway.authorisation.provider = new NonAdminTestAuthProvider(
      'token123'
    );

    render(
      <MobileOverflowMenu open onClose={vi.fn()} anchorEl={document.body} />,
      {
        wrapper: Wrapper,
      }
    );

    expect(
      screen.queryByRole('menuitem', { name: 'admin-page' })
    ).not.toBeInTheDocument();
  });

  it('hides help apge item when help page is disabled', () => {
    state.scigateway.features.showHelpPageButton = false;

    render(
      <MobileOverflowMenu open onClose={vi.fn()} anchorEl={document.body} />,
      {
        wrapper: Wrapper,
      }
    );

    expect(
      screen.queryByRole('menuitem', { name: 'help-page' })
    ).not.toBeInTheDocument();
  });
});
