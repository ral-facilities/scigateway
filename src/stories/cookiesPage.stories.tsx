import React from 'react';
import { storiesOf } from '@storybook/react';
import CookiesPage from '../cookieConsent/cookiesPage.component';
import { ReduxDecorator } from './utils';

storiesOf('Cookies page', module)
  .addParameters({
    info: {
      text: 'The cookie policy and cookie management page for the site',
    },
  })
  .addDecorator(ReduxDecorator(state => state))
  .add('default', () => <CookiesPage />);
