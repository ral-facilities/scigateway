import React from 'react';
import { storiesOf } from '@storybook/react';
import { FakeAsyncAction } from './utils';
import { LoginPageWithStyles } from '../loginPage/loginPage.component';

storiesOf('LoginPage', module)
  .addParameters({
    info: {
      text: 'This is the login page for the whole site.',
    },
  })
  .add('default', () => (
    <LoginPageWithStyles
      verifyUsernameAndPassword={(u, p) =>
        FakeAsyncAction(`verify username and password: ${u},${p}`)()
      }
      auth={{ loggedIn: false, failedToLogin: false, token: '' }}
      res={undefined}
    />
  ));
