import React from 'react';
import { storiesOf } from '@storybook/react';
import CookieConsent from '../cookieConsent/cookieConsent.component';
import { ReduxDecorator } from './utils';
import Cookies from 'js-cookie';

storiesOf('CookieConsent', module)
  .addParameters({
    info: {
      text: `The cookie consent dialog that prompts the user to accept or decline optional cookies.
        The cookie for this demo is set to expire after a second`,
    },
  })
  .addDecorator(
    ReduxDecorator((state) => ({
      ...state,
      siteLoading: false,
    }))
  )
  .add('default', () => {
    Cookies.remove('cookie-consent');
    return (
      <div>
        <CookieConsent />
      </div>
    );
  });
