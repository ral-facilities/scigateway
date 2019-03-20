import React from 'react';

import { storiesOf } from '@storybook/react';
import MainAppBar from '../mainAppBar/mainAppBar.component';

const placeHolderStyle = {
  height: 150,
  padding: 50,
  margin: 3,
  border: '2px dashed black',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

storiesOf('MainAppBar', module)
  .addParameters({
    info: {
      text: 'This is the main app bar for the whole site.',
    },
  })
  .add('default', () => (
    <div style={{ marginTop: 30, marginLeft: 10, marginRight: 10 }}>
      <MainAppBar />
      <div style={{ display: 'flex' }}>
        <div style={{ width: 180, ...placeHolderStyle }}>Navigation</div>
        <div style={{ width: '100%', ...placeHolderStyle }}>Plugins here</div>
      </div>
    </div>
  ));
