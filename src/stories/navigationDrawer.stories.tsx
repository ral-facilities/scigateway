import React from 'react';
import { storiesOf } from '@storybook/react';
import { NavigationDrawerWithStyles } from '../navigationDrawer/navigationDrawer.component';
import { FakeReduxAction } from './utils';

const placeHolderStyle = {
  height: 250,
  padding: 50,
  margin: 3,
  border: '2px dashed black',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

storiesOf('NavigationDrawer', module).add('default', () => (
  <div>
    <NavigationDrawerWithStyles
      open={true}
      plugins={[]}
      toggleDrawer={FakeReduxAction('toggle menu')}
    />
    <div
      style={{
        width: 'calc(100% - 400px)',
        ...placeHolderStyle,
        marginLeft: 250,
      }}
    >
      {' '}
      Main App Area
    </div>
  </div>
));
