import React from 'react';
import { storiesOf } from '@storybook/react';
import HomePageComponent from '../homePage/homePage.component';
import { ReduxDecorator } from './utils';

storiesOf('Homepage', module)
  .addParameters({
    info: {
      text: 'The homepage for the site',
    },
  })
  .addDecorator(ReduxDecorator((state) => state))
  .add('default', () => <HomePageComponent />);
