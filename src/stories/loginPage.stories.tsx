import React from 'react';
import { storiesOf } from '@storybook/react';
import { FakeAsyncAction } from './utils';
import { LoginPageWithStyles } from '../loginPage/loginPage.component';
import { storybookResourceStrings } from './storybookResourceStrings';

const buildLoginPage = (
  failedToLogin: boolean,
  loading: boolean
): React.ReactElement => (
  <LoginPageWithStyles
    verifyUsernameAndPassword={(u, p) =>
      FakeAsyncAction(`verify username and password: ${u},${p}`)()
    }
    auth={{
      loggedIn: false,
      failedToLogin,
      token: '',
      loading,
    }}
    res={storybookResourceStrings.login}
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
