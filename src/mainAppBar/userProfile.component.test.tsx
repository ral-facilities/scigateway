import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory, MemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore, { type MockStore } from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import TestAuthProvider from '../authentication/testAuthProvider';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { StateType } from '../state/state.types';
import { buildTheme } from '../theming';
import UserProfileComponent from './userProfile.component';

describe('User profile component', () => {
  let testStore: MockStore;
  let state: StateType;
  const theme = buildTheme(false);
  let history: MemoryHistory;

  function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
    return (
      <Provider store={testStore}>
        <Router history={history}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
          </StyledEngineProvider>
        </Router>
      </Provider>
    );
  }

  beforeEach(() => {
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
    };
    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );
    testStore = configureStore([thunk])(state);
    history = createMemoryHistory();
  });

  it('renders sign in button if not signed in', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider(null);

    render(<UserProfileComponent />, { wrapper: Wrapper });

    expect(
      screen.getByRole('button', { name: 'login-button' })
    ).toBeInTheDocument();
  });

  it('redirects to login when sign in is pressed', async () => {
    const user = userEvent.setup();
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
    history.replace('/test');

    render(<UserProfileComponent />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'login-button' }));

    expect(history.location.pathname).toBe('/login');
    expect(history.location.state).toEqual({
      referrer: '/test',
      referredFrom: 'clickingSignIn',
    });
  });

  it('renders sign in button if user signed in via autoLogin', () => {
    state.scigateway.authorisation.provider.autoLogin = () => Promise.resolve();

    window.localStorage.__proto__.getItem = vi
      .fn()
      .mockImplementation((name) => (name === 'autoLogin' ? 'true' : null));

    render(<UserProfileComponent />, { wrapper: Wrapper });

    expect(
      screen.getByRole('button', { name: 'login-button' })
    ).toBeInTheDocument();
    expect(localStorage.getItem).toBeCalledWith('autoLogin');
  });

  it('renders default avatar if signed in', () => {
    render(<UserProfileComponent />, { wrapper: Wrapper });

    expect(
      screen.getByRole('button', { name: 'Open user menu' })
    ).toBeInTheDocument();
  });

  it('renders user avatar if signed in with avatar url', () => {
    state.scigateway.authorisation.provider.user = {
      username: 'test',
      avatarUrl: 'test_url',
    };

    render(<UserProfileComponent />, { wrapper: Wrapper });

    expect(screen.getByRole('img')).toHaveAttribute('src', 'test_url');
  });

  it('opens menu when button clicked', async () => {
    const user = userEvent.setup();

    render(<UserProfileComponent />, { wrapper: Wrapper });

    expect(screen.queryByRole('menu')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Open user menu' }));

    expect(await screen.findByRole('menu')).toBeInTheDocument();
  });

  it('signs out if sign out clicked', async () => {
    const user = userEvent.setup();

    render(<UserProfileComponent />, { wrapper: Wrapper });

    // Click the user menu button and click on the sign out menu item.
    await user.click(screen.getByRole('button', { name: 'Open user menu' }));
    await user.click(
      within(screen.getByRole('menu')).getByRole('menuitem', {
        name: 'logout-button',
      })
    );

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual({ type: 'scigateway:signout' });
    expect(history.length).toEqual(2);
    expect(history.location.pathname).toEqual('/');
  });
});
