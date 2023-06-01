import React from 'react';
import LogoutPage, {
  CombinedLogoutPageProps,
  UnconnectedLogoutPage,
} from './logoutPage.component';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { Provider } from 'react-redux';
import { push } from 'connected-react-router';
import thunk from 'redux-thunk';
import TestAuthProvider from '../authentication/testAuthProvider';
import { buildTheme } from '../theming';
import { ThemeProvider } from '@mui/material/styles';
import { createLocation } from 'history';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('logout page component', () => {
  let props: CombinedLogoutPageProps;
  let mockStore;
  let state: StateType;

  function Wrapper({
    children,
  }: {
    children: React.ReactElement;
  }): JSX.Element {
    return <ThemeProvider theme={buildTheme(false)}>{children}</ThemeProvider>;
  }

  beforeEach(() => {
    mockStore = configureStore([thunk]);
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/') },
    };

    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );
  });

  it('renders the logout page correctly with default avatar ', () => {
    props = {
      user: {
        username: 'simple/root',
        isAdmin: false,
        avatarUrl: '',
      },
      res: undefined,
    };

    render(<UnconnectedLogoutPage {...props} />, { wrapper: Wrapper });

    expect(screen.getByTestId('AccountCircleIcon')).toBeInTheDocument();
    expect(screen.getByText('username-description')).toBeInTheDocument();
    expect(screen.getByText('simple/root')).toBeInTheDocument();
    expect(screen.getByText('logout-message')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'logout-button' })
    ).toBeInTheDocument();
  });

  it('renders the logout page correctly with avatar using avatarurl) ', () => {
    props = {
      user: {
        username: 'simple/root',
        isAdmin: false,
        avatarUrl: 'test_url',
      },
      res: undefined,
    };

    render(<UnconnectedLogoutPage {...props} />, { wrapper: Wrapper });

    expect(screen.getByRole('img')).toHaveAttribute('src', 'test_url');
    expect(screen.getByText('username-description')).toBeInTheDocument();
    expect(screen.getByText('simple/root')).toBeInTheDocument();
    expect(screen.getByText('logout-message')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'logout-button' })
    ).toBeInTheDocument();
  });

  it('signs out if sign out clicked', async () => {
    const testStore = mockStore(state);
    const user = userEvent.setup();

    render(
      <Provider store={testStore}>
        <LogoutPage />
      </Provider>,
      { wrapper: Wrapper }
    );

    await user.click(screen.getByRole('button', { name: 'logout-button' }));

    expect(testStore.getActions().length).toEqual(2);
    expect(testStore.getActions()[0]).toEqual({ type: 'scigateway:signout' });
    expect(testStore.getActions()[1]).toEqual(push('/'));
  });
});
