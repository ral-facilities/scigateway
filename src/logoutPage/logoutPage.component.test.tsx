import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import configureStore, { MockStore } from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import TestAuthProvider from '../authentication/testAuthProvider';
import { initialState } from '../state/reducers/scigateway.reducer';
import { StateType } from '../state/state.types';
import { buildTheme } from '../theming';
import LogoutPage from './logoutPage.component';

describe('logout page component', () => {
  let testStore: MockStore;

  let state: StateType;

  function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
    return (
      <ThemeProvider theme={buildTheme(false)}>
        <Provider store={testStore}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      </ThemeProvider>
    );
  }

  beforeEach(() => {
    state = {
      scigateway: { ...initialState },
    };
    testStore = configureStore([thunk])(state);

    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );
  });

  it('renders the logout page correctly with default avatar ', () => {
    state.scigateway.authorisation.provider.logIn('username', 'password');

    render(<LogoutPage />, { wrapper: Wrapper });

    expect(screen.getByTestId('AccountCircleIcon')).toBeInTheDocument();
    expect(screen.getByText('username-description')).toBeInTheDocument();
    expect(screen.getByText('username')).toBeInTheDocument();
    expect(screen.getByText('logout-message')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'logout-button' })
    ).toBeInTheDocument();
  });

  it('renders the logout page correctly with avatar using avatarurl) ', () => {
    state.scigateway.authorisation.provider.logIn(
      'username_with_avatar_url',
      'password'
    );

    render(<LogoutPage />, { wrapper: Wrapper });

    expect(screen.getByRole('img')).toHaveAttribute('src', 'test_url');
    expect(screen.getByText('username-description')).toBeInTheDocument();
    expect(screen.getByText('username_with_avatar_url')).toBeInTheDocument();
    expect(screen.getByText('logout-message')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'logout-button' })
    ).toBeInTheDocument();
  });

  it('signs out if sign out clicked', async () => {
    const user = userEvent.setup();

    render(<LogoutPage />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'logout-button' }));

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual({ type: 'scigateway:signout' });

    expect(window.location.pathname).toEqual('/');
  });
});
