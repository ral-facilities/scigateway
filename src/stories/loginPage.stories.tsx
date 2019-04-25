import React from 'react';
import { storiesOf } from '@storybook/react';
import { FakeAsyncAction } from './utils';
import { LoginPageWithStyles } from '../loginPage/loginPage.component';
import { storybookResourceStrings } from './storybookResourceStrings';
import { AuthProvider } from '../state/state.types';
import { createLocation } from 'history';

const fakeAuthProvider: AuthProvider = {
  isLoggedIn: () => true,
  logOut: () => {},
  logIn: () => Promise.resolve(),
  verifyLogIn: () => Promise.resolve(),
  redirectUrl: null,
  user: null,
};

const buildLoginPage = (
  failedToLogin: boolean,
  loading: boolean
): React.ReactElement => (
  <LoginPageWithStyles
    verifyUsernameAndPassword={(u, p) =>
      FakeAsyncAction(`verify username and password: ${u},${p}`)()
    }
    auth={{
      failedToLogin,
      signedOutDueToTokenExpiry: false,
      loading,
      provider: fakeAuthProvider,
    }}
    res={storybookResourceStrings.login}
    location={createLocation('/login')}
  />
);

storiesOf('LoginPage', module)
  .addParameters({
    info: {
      text: 'This is the login page for the whole site.',
    },
  })
  .add('default', () => buildLoginPage(false, false))
  .add('loading', () => buildLoginPage(false, true))
  .add('unsuccessful', () => buildLoginPage(true, false));
