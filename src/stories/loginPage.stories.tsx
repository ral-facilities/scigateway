import React from 'react';
import { storiesOf } from '@storybook/react';
import { FakeReduxAction } from './utils';
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
        FakeReduxAction(`verify username and password: ${u},${p}`)()
      }
    />
  ));
