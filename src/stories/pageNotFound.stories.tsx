import React from 'react';
import { storiesOf } from '@storybook/react';
import PageNotFound from '../pageNotFound/pageNotFound.component';

storiesOf('Page not found', module)
  .addParameters({
    info: {
      text: 'This page not found view for the whole site.',
    },
  })
  .add('default', () => <PageNotFound />);
