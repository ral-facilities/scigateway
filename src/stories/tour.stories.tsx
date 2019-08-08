import React from 'react';
import { TourWithStyles } from '../tour/tour.component';
import { storiesOf } from '@storybook/react';
import { FakeReduxAction } from './utils';

storiesOf('Tour', module)
  .addParameters({
    info: {
      text:
        'This is the help tour that shows help tooltips on specified sections of the site.',
    },
  })
  .add('renders correctly', () => (
    <div>
      <TourWithStyles
        showHelp={true}
        helpSteps={[
          { target: '.test-1', content: 'Test 1' },
          { target: '.test-2', content: 'Test 2' },
          { target: '#plugin-link-test', content: 'Plugin link test' },
        ]}
        drawerOpen={false}
        loggedIn={true}
        toggleDrawer={FakeReduxAction('toggle menu')}
        dismissHelp={FakeReduxAction('dismiss help')}
      />
      <div className="test-1" />
      <div className="test-2" />
      <div id="plugin-link-test" />
    </div>
  ));
