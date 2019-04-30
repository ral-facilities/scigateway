import React from 'react';
import {
  LoginPageWithStyles,
  CredentialsLoginScreen,
  RedirectLoginScreen,
  CombinedLoginProps,
} from './loginPage.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { buildTheme } from '../theming';
import { MuiThemeProvider } from '@material-ui/core';
import TestAuthProvider from '../authentication/testAuthProvider';
import { createLocation } from 'history';

describe('Login page component', () => {
  let shallow;
  let mount;
  let props: CombinedLoginProps;

  const dummyClasses = {
    root: 'root-1',
  };

  beforeEach(() => {
    shallow = createShallow();
    mount = createMount();

    props = {
      auth: {
        loading: false,
        failedToLogin: false,
        signedOutDueToTokenExpiry: false,
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
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('redirect component renders correctly', () => {
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <RedirectLoginScreen {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('login page renders credential component if no redirect url', () => {
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <LoginPageWithStyles {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper.dive().dive()).toMatchSnapshot();
  });

  it('login page renders redirect component if redirect url present', () => {
    props.auth.provider.redirectUrl = 'test redirect';
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <LoginPageWithStyles {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper.dive().dive()).toMatchSnapshot();
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
  });
});
