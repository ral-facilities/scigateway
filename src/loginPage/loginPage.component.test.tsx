import React from 'react';
import LoginPage, {
  AnonLoginScreen,
  CombinedLoginProps,
  CredentialsLoginScreen,
  LoginSelector,
  RedirectLoginScreen,
  UnconnectedLoginPage,
} from './loginPage.component';
import { buildTheme } from '../theming';
import { ThemeProvider } from '@mui/material/styles';
import TestAuthProvider from '../authentication/testAuthProvider';
import { createLocation, createMemoryHistory, MemoryHistory } from 'history';
import axios from 'axios';
import { ICATAuthenticator, StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import {
  loadingAuthentication,
  resetAuthState,
} from '../state/actions/scigateway.actions';
import { Provider } from 'react-redux';
import { thunk } from 'redux-thunk';
import { AnyAction } from 'redux';
import { NotificationType } from '../state/scigateway.types';
import log from 'loglevel';
import {
  act,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Router } from 'react-router-dom';

vi.mock('loglevel');

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

  it('sets a new mnemonic in local state on mnemonic change', async () => {
    const mnemonics: ICATAuthenticator[] = [
      {
        mnemonic: 'user/pass',
        keys: [{ name: 'username' }, { name: 'password' }],
      },
      {
        mnemonic: 'anon',
        keys: [],
      },
    ];
    const user = userEvent.setup();
    const testSetMnemonic = vi.fn();

    render(
      <LoginSelector
        {...props}
        mnemonics={mnemonics}
        mnemonic="user/pass"
        setMnemonic={testSetMnemonic}
      />
    );

    await user.click(screen.getByRole('combobox', { name: /authenticator/i }));
    await user.selectOptions(
      screen.getByRole('listbox', { name: /authenticator/i }),
      screen.getByRole('option', { name: 'anon' })
    );

    await waitFor(() => {
      expect(testSetMnemonic).toBeCalledWith('anon');
    });
  });
});

describe('Login page component', () => {
  let props: CombinedLoginProps;
  let mockStore;
  let state: StateType;
  let history: MemoryHistory;

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
    render(<RedirectLoginScreen {...props} />, { wrapper: Wrapper });
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
      screen.getByRole('button', { name: 'Login with Github' })
    ).toBeInTheDocument();
  });

  it('login page renders dropdown if mnemonic present + there are multiple mnemonics (but it filters out anon)', async () => {
    props.auth.provider.mnemonic = '';
    vi.mocked(axios.get).mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            mnemonic: 'user/pass',
            keys: [{ name: 'username' }, { name: 'password' }],
          },
          {
            mnemonic: 'ldap',
            keys: [{ name: 'username' }, { name: 'password' }],
          },
          {
            mnemonic: 'anon',
            keys: [],
          },
        ],
      })
    );

    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });

    expect(
      await screen.findByRole('combobox', { name: /authenticator/i })
    ).toBeInTheDocument();
  });

  it("login page doesn't render dropdown if anon is the only other authenticator", async () => {
    props.auth.provider.mnemonic = '';
    vi.mocked(axios.get).mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            mnemonic: 'user/pass',
            keys: [{ name: 'username' }, { name: 'password' }],
          },
          {
            mnemonic: 'anon',
            keys: [],
          },
        ],
      })
    );

    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.queryByRole('button', { name: /authenticator/i })).toBeNull();
  });

  it('login page renders anonymous login if mnemonic present with no keys', async () => {
    props.auth.provider.mnemonic = 'nokeys';
    vi.mocked(axios.get).mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            mnemonic: 'nokeys',
            keys: [],
          },
        ],
      })
    );

    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });

    expect(await screen.findByTestId('anon-login-screen')).toBeInTheDocument();
  });

  it('login page renders credentials login if mnemonic present + user/pass is selected', async () => {
    props.auth.provider.mnemonic = 'user/pass';
    vi.mocked(axios.get).mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            mnemonic: 'user/pass',
            keys: [{ name: 'username' }, { name: 'password' }],
          },
        ],
      })
    );

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

  it('login page renders spinner if auth is loading', async () => {
    props.auth.loading = true;
    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });

  it('login page displays and logs an error if fetchMnemonics fails', async () => {
    props.auth.provider.mnemonic = '';
    log.error = vi.fn();
    vi.mocked(axios.get).mockImplementation(() => Promise.reject());
    const events: CustomEvent<AnyAction>[] = [];

    const dispatchEventSpy = vi
      .spyOn(document, 'dispatchEvent')
      .mockImplementation((e) => {
        events.push(e as CustomEvent<AnyAction>);
        return true;
      });

    render(<UnconnectedLoginPage {...props} />, {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(dispatchEventSpy).toHaveBeenCalled();
    });
    expect(events.length).toEqual(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        message:
          'It is not possible to authenticate you at the moment. Please, try again later',
        severity: 'error',
      },
    });

    expect(log.error).toHaveBeenCalled();
    expect(vi.mocked(log.error).mock.calls[0][0]).toEqual(
      'It is not possible to authenticate you at the moment. Please, try again later'
    );
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
    expect(mockLoginfn.mock.calls[0]).toEqual([
      'new username',
      'new password',
      undefined,
    ]);

    await user.clear(usernameTextBox);
    await user.clear(passwordBox);
    await user.type(usernameTextBox, 'new username 2');
    await user.type(passwordBox, 'new password 2{enter}');

    expect(mockLoginfn.mock.calls.length).toEqual(2);
    expect(mockLoginfn.mock.calls[1]).toEqual([
      'new username 2',
      'new password 2',
      undefined,
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
      await screen.findByRole('button', { name: 'Login with Github' })
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
    expect(mockLoginfn.mock.calls[0]).toEqual([
      '',
      '?token=test_token',
      undefined,
    ]);
  });

  it('on submit verification method should be called when logs in via keyless authenticator', async () => {
    const mockLoginfn = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    props.verifyUsernameAndPassword = mockLoginfn;
    props.auth.provider.mnemonic = 'nokeys';

    vi.mocked(axios.get).mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            mnemonic: 'nokeys',
            keys: [],
          },
        ],
      })
    );

    render(<UnconnectedLoginPage {...props} />, { wrapper: Wrapper });

    await user.click(
      await screen.findByRole('button', { name: 'login.login-button' })
    );

    expect(mockLoginfn.mock.calls.length).toEqual(1);
    expect(mockLoginfn.mock.calls[0]).toEqual(['', '', 'nokeys']);
  });

  it('verifyUsernameAndPassword action should be sent when the verifyUsernameAndPassword function is called', async () => {
    state.scigateway.authorisation.provider.redirectUrl = 'test redirect';
    history.replace('/login?token=test_token');
    state.scigateway.authorisation.provider.mnemonic = 'nokeys';

    vi.mocked(axios.get).mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            mnemonic: 'nokeys',
            keys: [],
          },
        ],
      })
    );

    const testStore = mockStore(state);

    render(
      <Provider store={testStore}>
        <LoginPage />
      </Provider>,
      { wrapper: Wrapper }
    );

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

    expect(testStore.getActions()[0]).toEqual(loadingAuthentication());
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
