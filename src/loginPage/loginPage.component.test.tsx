import React from 'react';
import {
  LoginPageWithoutStyles,
  LoginPageWithStyles,
  CredentialsLoginScreen,
  RedirectLoginScreen,
  CombinedLoginProps,
} from './loginPage.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { buildTheme } from '../theming';
import { MuiThemeProvider } from '@material-ui/core/styles';
import TestAuthProvider from '../authentication/testAuthProvider';
import { createLocation } from 'history';

describe('Login page component', () => {
  let shallow;
  let mount;
  let props: CombinedLoginProps;

  const dummyClasses = {
    root: 'root-1',
    paper: 'paper-class',
    avatar: 'avatar-class',
    spinner: 'spinner-class',
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();

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
      classes: dummyClasses,
    };
  });

  const theme = buildTheme();

  it('credential component renders correctly', () => {
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

  it('login page renders credential component if no redirect url', () => {
    const wrapper = shallow(<LoginPageWithoutStyles {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('login page renders redirect component if redirect url present', () => {
    props.auth.provider.redirectUrl = 'test redirect';
    const wrapper = shallow(<LoginPageWithoutStyles {...props} />);
    expect(wrapper).toMatchSnapshot();
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

  it('on location.search filled in verification method should be called with blank username and qeury string', () => {
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
});
