import React from 'react';
import { storiesOf } from '@storybook/react';
import HomePageComponent from '../homePage/homePage.component';

storiesOf('Homepage', module)
  .addParameters({
    info: {
      text: 'The homepage for the site',
    },
  })
  .add('default', () => <HomePageComponent />);
