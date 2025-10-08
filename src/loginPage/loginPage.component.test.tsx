import { ThemeProvider } from '@mui/material/styles';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createLocation, createMemoryHistory, MemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import TestAuthProvider from '../authentication/testAuthProvider';
import { resetAuthState } from '../state/actions/scigateway.actions';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { Authenticator, StateType } from '../state/state.types';
import { buildTheme } from '../theming';
import LoginPage, {
  AnonLoginScreen,
  CombinedLoginProps,
  CredentialsLoginScreen,
  LoginSelector,
  RedirectLoginScreen,
  UnconnectedLoginPage,
} from './loginPage.component';

describe('Login selector component', () => {
  let props: CombinedLoginProps;

  beforeEach(() => {
    props = {
      auth: {
        failedToLogin: false,
        signedOutDueToTokenInvalidation: false,
        loading: false,
        provider: new TestAuthProvider(null),
      },
      res: undefined,
      verifyUsernameAndPassword: vi.fn(),
      resetAuthState: vi.fn(),
    };
  });

  it('sets a new authenticator in local state on authenticator change', async () => {
    const authenticators: Authenticator[] = [
      {
        displayName: 'Password',
        key: 'user/pass',
        type: 'userpass',
      },
      {
        displayName: 'anon',
        key: 'anon',
        type: 'anon',
      },
    ];
    const user = userEvent.setup();
    const testChangeAuthenticator = vi.fn();

    render(
      <LoginSelector
        {...props}
        authenticators={authenticators}
        authenticator="user/pass"
        changeAuthenticator={testChangeAuthenticator}
      />
    );

    await user.click(screen.getByRole('combobox', { name: /authenticator/i }));
    await user.selectOptions(
      screen.getByRole('listbox', { name: /authenticator/i }),
      screen.getByRole('option', { name: 'anon' })
    );

    await waitFor(() => {
      expect(testChangeAuthenticator).toBeCalledWith('anon');
    });
  });
});

describe('Login page component', () => {
  let props: CombinedLoginProps;
  let mockStore;
  let state: StateType;
  let history: MemoryHistory;

  const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

  beforeEach(() => {
    mockStore = configureStore([thunk]);

    history = createMemoryHistory({ initialEntries: ['/login'] });

    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: {
        location: { ...createLocation('/'), query: {} },
        action: 'POP',
      },
    };

    props = {
      auth: {
        failedToLogin: false,
        signedOutDueToTokenInvalidation: false,
        loading: false,
        provider: new TestAuthProvider(null),
      },
      res: undefined,
      verifyUsernameAndPassword: () => Promise.resolve(),
      resetAuthState: vi.fn(),
    };

    state.scigateway.authorisation = props.auth;
  });

  afterEach(() => {
    getItemSpy.mockReset();
    setItemSpy.mockReset();
  });

  function Wrapper({
    children,
  }: {
    children: React.ReactElement;
  }): JSX.Element {
    return (
      <Router history={history}>
        <ThemeProvider theme={buildTheme(false)}>{children}</ThemeProvider>
      </Router>
    );
  }

  it('credential component renders correctly', () => {
    render(<CredentialsLoginScreen {...props} />, { wrapper: Wrapper });
    expect(
      screen.getByRole('textbox', { name: 'login.username-arialabel' })
    ).toBeInTheDocument();
    // for some unknown reason password input type does not have a role???
    // https://github.com/testing-library/dom-testing-library/issues/567
    expect(
      screen.getByLabelText('login.password-arialabel')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'login.forgotten-your-password' })
    ).toHaveAttribute('href', 'login.forgotten-your-password-link');
    expect(
      screen.getByRole('button', { name: 'login.login-button' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'login.need-help-signing-in' })
    ).toHaveAttribute('href', 'login.need-help-signing-in-link');
    expect(screen.getByRole('link', { name: 'Sign up now' })).toHaveAttribute(
      'href',
      'login.dont-have-an-account-sign-up-now-link'
    );
  });

  it('credential component renders failedToLogin error correctly', () => {
    props.auth.failedToLogin = true;
    render(<CredentialsLoginScreen {...props} />, { wrapper: Wrapper });
    expect(screen.getByText('login.login-error-msg')).toBeInTheDocument();
  });

  it('credential component renders signedOutDueToTokenInvalidation error correctly', () => {
    props.auth.signedOutDueToTokenInvalidation = true;
    render(<CredentialsLoginScreen {...props} />, { wrapper: Wrapper });
    expect(screen.getByText('login.token-invalid-msg')).toBeInTheDocument();
  });

  it('redirect component renders correctly', () => {
    render(<RedirectLoginScreen {...props} displayName="Github" />, {
      wrapper: Wrapper,
    });
    expect(
      screen.getByRole('button', { name: 'Login with Github' })
    ).toBeInTheDocument();
  });

  it('redirect component renders failedToLogin error correctly', () => {
    props.auth.failedToLogin = true;
    render(<RedirectLoginScreen {...props} />, { wrapper: Wrapper });
    expect(
      screen.getByText('login.login-redirect-error-msg')
    ).toBeInTheDocument();
  });

  it('anonymous component renders correctly', () => {
    render(<AnonLoginScreen {...props} />, { wrapper: Wrapper });
    expect(
      screen.getByRole('button', { name: 'login.login-button' })
    ).toBeInTheDocument();
  });

  it('anonymous component renders failedToLogin error correctly', () => {
    props.auth.failedToLogin = true;
    render(<AnonLoginScreen {...props} />, { wrapper: Wrapper });
    expect(screen.getByText('login.login-error-msg')).toBeInTheDocument();
  });

  it('anonymous component renders signedOutDueToTokenInvalidation error correctly', () => {
    props.auth.signedOutDueToTokenInvalidation = true;
    render(<AnonLoginScreen {...props} />, { wrapper: Wrapper });
    expect(screen.getByText('login.token-invalid-msg')).toBeInTheDocument();
  });

  it('login page renders credential component if no redirect url', () => {
    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });
    expect(
      screen.getByRole('textbox', { name: 'login.username-arialabel' })
    ).toBeInTheDocument();
    // for some unknown reason password input type does not have a role???
    // https://github.com/testing-library/dom-testing-library/issues/567
    expect(
      screen.getByLabelText('login.password-arialabel')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'login.forgotten-your-password' })
    ).toHaveAttribute('href', 'login.forgotten-your-password-link');
    expect(
      screen.getByRole('button', { name: 'login.login-button' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'login.need-help-signing-in' })
    ).toHaveAttribute('href', 'login.need-help-signing-in-link');
    expect(screen.getByRole('link', { name: 'Sign up now' })).toHaveAttribute(
      'href',
      'login.dont-have-an-account-sign-up-now-link'
    );
  });

  it('login page renders redirect component if redirect url present', () => {
    props.auth.provider.redirectUrl = 'test redirect';
    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });
    expect(
      screen.getByRole('button', { name: 'Login with unknown' })
    ).toBeInTheDocument();
  });

  it('login page renders dropdown if multiple authenticators are present', async () => {
    props.auth.provider.authenticators = [
      {
        key: 'Test1',
        type: 'userpass',
        displayName: 'Test 1',
      },
      {
        key: 'Test2',
        type: 'redirect',
        displayName: 'Test 2',
      },
    ];

    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });

    expect(
      await screen.findByRole('combobox', { name: /authenticator/i })
    ).toBeInTheDocument();
  });

  it('login page renders anonymous login if anon auth present', async () => {
    props.auth.provider.authenticators = [
      {
        key: 'anon',
        type: 'anon',
        displayName: 'Anonymous',
      },
    ];

    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });

    expect(await screen.findByTestId('anon-login-screen')).toBeInTheDocument();
  });

  it('login page renders credentials login if only single user pass login', async () => {
    props.auth.provider.authenticators = [
      {
        key: 'Test1',
        type: 'userpass',
        displayName: 'Test 1',
      },
    ];

    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });

    expect(
      await screen.findByRole('textbox', { name: 'login.username-arialabel' })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('login.password-arialabel')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'login.forgotten-your-password' })
    ).toHaveAttribute('href', 'login.forgotten-your-password-link');
    expect(
      screen.getByRole('button', { name: 'login.login-button' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'login.need-help-signing-in' })
    ).toHaveAttribute('href', 'login.need-help-signing-in-link');
    expect(screen.getByRole('link', { name: 'Sign up now' })).toHaveAttribute(
      'href',
      'login.dont-have-an-account-sign-up-now-link'
    );
  });

  it('login page renders redirect login if only single redirect login with delayed init', async () => {
    const mockSetAuthenticator = vi.fn();
    const mockGetAuthenticator = vi.fn().mockReturnValue(undefined);

    props.auth.provider.getAuthenticator = mockGetAuthenticator;
    props.auth.provider.setAuthenticator = mockSetAuthenticator;
    props.auth.provider.authenticators = [];
    props.auth.provider.redirectUrl = 'unknown';

    let promiseResolve = () => {};
    props.auth.provider.initialise = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          promiseResolve = () => {
            props.auth.provider.authenticators = [
              {
                key: 'Test2',
                type: 'redirect',
                displayName: 'Test 2',
              },
            ];
            resolve();
          };
        })
    );

    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();

    act(() => {
      promiseResolve();
    });

    expect(
      await screen.findByRole('button', { name: 'Login with Test 2' })
    ).toBeInTheDocument();
    expect(mockSetAuthenticator).toHaveBeenCalledWith(
      'Test2',
      undefined,
      undefined
    );
  });

  it('login page re-initialises an authenticator if it is mounted with an authenticator already selected', async () => {
    const mockSetAuthenticator = vi.fn();
    const mockGetAuthenticator = vi.fn().mockReturnValue('Test2');

    props.auth.provider.getAuthenticator = mockGetAuthenticator;
    props.auth.provider.setAuthenticator = mockSetAuthenticator;
    props.auth.provider.authenticators = [
      {
        key: 'Test2',
        type: 'redirect',
        displayName: 'Test 2',
      },
      {
        key: 'Test1',
        type: 'userpass',
        displayName: 'Test 1',
      },
    ];
    props.auth.provider.redirectUrl = 'unknown';

    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });

    expect(
      await screen.findByRole('button', { name: 'Login with Test 2' })
    ).toBeInTheDocument();
    expect(mockSetAuthenticator).toHaveBeenCalledWith(
      'Test2',
      undefined,
      undefined
    );
  });

  it('login page renders spinner if auth is loading', async () => {
    props.auth.loading = true;
    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });

  it('on submit verification method should be called with username and password arguments', async () => {
    const mockLoginfn = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    props.verifyUsernameAndPassword = mockLoginfn;

    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });

    const usernameTextBox = await screen.findByRole('textbox', {
      name: 'login.username-arialabel',
    });
    const passwordBox = screen.getByLabelText('login.password-arialabel');

    await user.type(usernameTextBox, 'new username');
    await user.type(passwordBox, 'new password');

    await user.click(
      screen.getByRole('button', { name: 'login.login-button' })
    );

    expect(mockLoginfn.mock.calls.length).toEqual(1);
    expect(mockLoginfn.mock.calls[0]).toEqual(['new username', 'new password']);

    await user.clear(usernameTextBox);
    await user.clear(passwordBox);
    await user.type(usernameTextBox, 'new username 2');
    await user.type(passwordBox, 'new password 2{enter}');

    expect(mockLoginfn.mock.calls.length).toEqual(2);
    expect(mockLoginfn.mock.calls[1]).toEqual([
      'new username 2',
      'new password 2',
    ]);
  });

  it('on submit window location should change for redirect', async () => {
    const user = userEvent.setup();
    props.auth.provider.redirectUrl = 'test redirect';

    global.window = Object.create(window);
    const windowLocation = JSON.stringify(window.location);
    Object.defineProperty(window, 'location', {
      value: JSON.parse(windowLocation),
    });

    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });

    await user.click(
      await screen.findByRole('button', { name: 'Login with unknown' })
    );

    expect(window.location.href).toEqual('test redirect');
  });

  it('on location.search filled in verification method should be called with blank username and query string', async () => {
    props.auth.provider.redirectUrl = 'test redirect';
    history.replace('/login?token=test_token');

    const promise = Promise.resolve();
    const mockLoginfn = vi.fn(() => promise);
    props.verifyUsernameAndPassword = mockLoginfn;

    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });

    await act(async () => {
      await promise;
    });

    expect(mockLoginfn.mock.calls.length).toEqual(1);
    expect(mockLoginfn.mock.calls[0]).toEqual(['', '?token=test_token']);
  });

  it('on location.search filled in verification method should be called with blank username and query string (OIDC)', async () => {
    getItemSpy.mockReturnValue('https://example.com');
    const mockSetAuthenticator = vi.fn();
    props.auth.provider.setAuthenticator = mockSetAuthenticator;
    history.replace('/login?token=test_token', { referrer: '/myplugin' });

    const promise = Promise.resolve();
    const mockLoginfn = vi.fn(() => promise);
    props.verifyUsernameAndPassword = mockLoginfn;

    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });

    await act(async () => {
      await promise;
    });

    expect(mockLoginfn.mock.calls.length).toEqual(1);
    expect(mockLoginfn.mock.calls[0]).toEqual(['', '?token=test_token']);
    expect(mockSetAuthenticator).toHaveBeenCalledWith(
      'https://example.com',
      true,
      '/myplugin'
    );
  });

  it('on submit verification method should be called when logs in via keyless authenticator', async () => {
    const mockLoginfn = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    props.verifyUsernameAndPassword = mockLoginfn;
    props.auth.provider.authenticators = [
      {
        key: 'anon',
        type: 'anon',
        displayName: 'Anonymous',
      },
    ];

    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });

    await user.click(
      await screen.findByRole('button', { name: 'login.login-button' })
    );

    expect(mockLoginfn.mock.calls.length).toEqual(1);
    expect(mockLoginfn.mock.calls[0]).toEqual(['', '']);
  });

  it('visiting the login page after a failed login attempt resets the auth state', () => {
    state.scigateway.authorisation.failedToLogin = true;
    state.scigateway.authorisation.signedOutDueToTokenInvalidation = false;

    const testStore = mockStore(state);

    render(
      <Provider store={testStore}>
        <LoginPage />
      </Provider>,
      { wrapper: Wrapper }
    );

    expect(testStore.getActions()[0]).toEqual(resetAuthState());
  });
});
