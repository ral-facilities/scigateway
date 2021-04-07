import React from 'react';
import * as singleSpa from 'single-spa';
import LoginPage, {
  LoginPageWithoutStyles,
  LoginPageWithStyles,
  CredentialsLoginScreen,
  RedirectLoginScreen,
  CombinedLoginProps,
  AnonLoginScreen,
} from './loginPage.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { buildTheme } from '../theming';
import { MuiThemeProvider } from '@material-ui/core/styles';
import TestAuthProvider from '../authentication/testAuthProvider';
import { createLocation } from 'history';
import axios from 'axios';
import { flushPromises } from '../setupTests';
import { act } from 'react-dom/test-utils';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import {
  loadAuthProvider,
  loadingAuthentication,
} from '../state/actions/scigateway.actions';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { AnyAction } from 'redux';
import { NotificationType } from '../state/scigateway.types';
import * as log from 'loglevel';
import { Select } from '@material-ui/core';

jest.mock('loglevel');

describe('Login page component', () => {
  let shallow;
  let mount;
  let props: CombinedLoginProps;
  let mockStore;
  let state: StateType;

  const dummyClasses = {
    root: 'root-1',
    paper: 'paper-class',
    avatar: 'avatar-class',
    spinner: 'spinner-class',
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
    mockStore = configureStore([thunk]);

    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/') },
    };

    props = {
      auth: {
        failedToLogin: false,
        signedOutDueToTokenInvalidation: false,
        loading: false,
        provider: new TestAuthProvider(null),
      },
      location: createLocation('/'),
      res: undefined,
      verifyUsernameAndPassword: () => Promise.resolve(),
      changeMnemonic: jest.fn(),
      classes: dummyClasses,
    };

    state.scigateway.authorisation = props.auth;

    singleSpa.start();
  });

  const theme = buildTheme(false);

  it('credential component renders correctly', () => {
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <CredentialsLoginScreen {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('credential component renders failedToLogin error correctly', () => {
    props.auth.failedToLogin = true;
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <CredentialsLoginScreen {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('credential component renders signedOutDueToTokenInvalidation error correctly', () => {
    props.auth.signedOutDueToTokenInvalidation = true;
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <CredentialsLoginScreen {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('redirect component renders correctly', () => {
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <RedirectLoginScreen {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('redirect component renders failedToLogin error correctly', () => {
    props.auth.failedToLogin = true;
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <RedirectLoginScreen {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('anonymous component renders correctly', () => {
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <AnonLoginScreen {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('anonymous component renders failedToLogin error correctly', () => {
    props.auth.failedToLogin = true;
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <AnonLoginScreen {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('anonymous component renders signedOutDueToTokenInvalidation error correctly', () => {
    props.auth.signedOutDueToTokenInvalidation = true;
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <AnonLoginScreen {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('login page renders credential component if no redirect url', () => {
    const wrapper = shallow(<LoginPageWithoutStyles {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('login page renders redirect component if redirect url present', () => {
    props.auth.provider.redirectUrl = 'test redirect';
    const wrapper = shallow(<LoginPageWithoutStyles {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('login page renders dropdown if mnemonic present + there are multiple mnemonics', async () => {
    props.auth.provider.mnemonic = '';
    (axios.get as jest.Mock).mockImplementation(() =>
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

    const spy = jest
      .spyOn(React, 'useEffect')
      .mockImplementationOnce((f) => f());

    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <LoginPageWithoutStyles {...props} />
      </MuiThemeProvider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper).toMatchSnapshot();
    spy.mockRestore();
  });

  it('login page renders anonymous login if mnemonic present + anon is selected', async () => {
    props.auth.provider.mnemonic = 'anon';
    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            mnemonic: 'anon',
            keys: [],
          },
        ],
      })
    );

    const spy = jest
      .spyOn(React, 'useEffect')
      .mockImplementationOnce((f) => f());

    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <LoginPageWithoutStyles {...props} />
      </MuiThemeProvider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper).toMatchSnapshot();
    spy.mockRestore();
  });

  it('login page renders credentials login if mnemonic present + user/pass is selected', async () => {
    props.auth.provider.mnemonic = 'user/pass';
    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            mnemonic: 'user/pass',
            keys: [{ name: 'username' }, { name: 'password' }],
          },
        ],
      })
    );

    const spy = jest
      .spyOn(React, 'useEffect')
      .mockImplementationOnce((f) => f());

    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <LoginPageWithoutStyles {...props} />
      </MuiThemeProvider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper).toMatchSnapshot();
    spy.mockRestore();
  });

  it('login page renders spinner if auth is loading', () => {
    props.auth.loading = true;
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <LoginPageWithoutStyles {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('login page displays and logs an error if fetchMnemonics fails', async () => {
    props.auth.provider.mnemonic = '';
    (axios.get as jest.Mock).mockImplementation(() => Promise.reject());
    const events: CustomEvent<AnyAction>[] = [];

    const spy = jest
      .spyOn(React, 'useEffect')
      .mockImplementationOnce((f) => f());
    const dispatchEventSpy = jest
      .spyOn(document, 'dispatchEvent')
      .mockImplementation((e) => {
        events.push(e as CustomEvent<AnyAction>);
        return true;
      });

    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <LoginPageWithoutStyles {...props} />
      </MuiThemeProvider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(dispatchEventSpy).toHaveBeenCalled();
    expect(events.length).toEqual(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        message: 'Failed to fetch authenticator information from ICAT',
        severity: 'error',
      },
    });

    expect(log.error).toHaveBeenCalled();
    expect((log.error as jest.Mock).mock.calls[0][0]).toEqual(
      'Failed to fetch authenticator information from ICAT'
    );
    spy.mockRestore();
  });

  it('loadAuthProvider action should be sent when user selects an authenticator in authenticator dropdown', async () => {
    state.scigateway.authorisation.provider.mnemonic = '';
    state.scigateway.authorisation.provider.authUrl = 'http://localhost:8000';

    (axios.get as jest.Mock).mockImplementation(() =>
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

    const testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <MuiThemeProvider theme={theme}>
          <LoginPage />
        </MuiThemeProvider>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Find the Select component for the dropdown authenticators list.
    const simulateDropdown = wrapper.find(Select).first();
    simulateDropdown.prop('onChange')({ target: { value: 'user/pass' } });

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(
      loadAuthProvider('icat.user/pass', 'http://localhost:8000')
    );
  });

  it('on submit verification method should be called with username and password arguments', async () => {
    const mockLoginfn = jest.fn();
    props.verifyUsernameAndPassword = mockLoginfn;

    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <LoginPageWithStyles {...props} />
      </MuiThemeProvider>
    );

    const simulateUsernameInput = wrapper.find('input').at(0);
    simulateUsernameInput.instance().value = 'new username';
    simulateUsernameInput.simulate('change');

    const simulatePasswordInput = wrapper.find('input').at(1);
    simulatePasswordInput.instance().value = 'new password';
    simulatePasswordInput.simulate('change');

    wrapper.find('button').simulate('click');

    expect(mockLoginfn.mock.calls.length).toEqual(1);

    expect(mockLoginfn.mock.calls[0]).toEqual(['new username', 'new password']);

    simulateUsernameInput.instance().value = 'new username 2';
    simulateUsernameInput.simulate('change');

    simulatePasswordInput.instance().value = 'new password 2';
    simulatePasswordInput.simulate('change');

    wrapper
      .find(CredentialsLoginScreen)
      .find('div')
      .first()
      .simulate('keypress', { key: 'Enter' });

    expect(mockLoginfn.mock.calls.length).toEqual(2);

    expect(mockLoginfn.mock.calls[1]).toEqual([
      'new username 2',
      'new password 2',
    ]);
  });

  it('on submit window location should change for redirect', () => {
    props.auth.provider.redirectUrl = 'test redirect';

    global.window = Object.create(window);
    const windowLocation = JSON.stringify(window.location);
    Object.defineProperty(window, 'location', {
      value: JSON.parse(windowLocation),
    });

    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <LoginPageWithStyles {...props} />
      </MuiThemeProvider>
    );

    wrapper.find('button').simulate('click');

    expect(window.location.href).toEqual('test redirect');
  });

  it('on location.search filled in verification method should be called with blank username and query string', () => {
    props.auth.provider.redirectUrl = 'test redirect';
    props.location.search = '?token=test_token';

    const mockLoginfn = jest.fn();
    props.verifyUsernameAndPassword = mockLoginfn;

    // TODO: switch to shallow when enzyme supports hooks/useEffect
    mount(
      <MuiThemeProvider theme={theme}>
        <LoginPageWithStyles {...props} />
      </MuiThemeProvider>
    );

    expect(mockLoginfn.mock.calls.length).toEqual(1);
    expect(mockLoginfn.mock.calls[0]).toEqual(['', '?token=test_token']);
  });

  it('on submit verification method should be called when logs in via anon authenticator', async () => {
    const mockLoginfn = jest.fn();
    props.verifyUsernameAndPassword = mockLoginfn;
    props.auth.provider.mnemonic = 'anon';

    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            mnemonic: 'anon',
            keys: [],
          },
        ],
      })
    );

    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <LoginPageWithStyles {...props} />
      </MuiThemeProvider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    wrapper.find('button').simulate('click');

    expect(mockLoginfn.mock.calls.length).toEqual(1);

    expect(mockLoginfn.mock.calls[0]).toEqual(['', '']);

    wrapper
      .find(AnonLoginScreen)
      .find('div')
      .first()
      .simulate('keypress', { key: 'Enter' });

    expect(mockLoginfn.mock.calls.length).toEqual(2);

    expect(mockLoginfn.mock.calls[1]).toEqual(['', '']);
  });

  it('verifyUsernameAndPassword action should be sent when the verifyUsernameAndPassword function is called', () => {
    state.scigateway.authorisation.provider.redirectUrl = 'test redirect';
    state.router.location.search = '?token=test_token';

    const testStore = mockStore(state);

    mount(
      <Provider store={testStore}>
        <MuiThemeProvider theme={theme}>
          <LoginPage />
        </MuiThemeProvider>
      </Provider>
    );

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(loadingAuthentication());
  });
});
