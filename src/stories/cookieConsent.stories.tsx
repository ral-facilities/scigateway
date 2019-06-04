import React from 'react';
import { storiesOf } from '@storybook/react';
import CookieConsent from '../cookieConsent/cookieConsent.component';
import { ReduxDecorator } from './utils';

storiesOf('CookieConsent', module)
  .addParameters({
    info: {
      text: `The cookie consent dialog that prompts the user to accept or decline optional cookies.
        The cookie for this demo is set to expire after a second`,
    },
  })
  .addDecorator(ReduxDecorator(state => state))
  .add('default', () => (
    <div>
      <CookieConsent daysCookieValidFor={10 / 86400} />
    </div>
  ));
