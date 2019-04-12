import React from 'react';
import { storiesOf } from '@storybook/react';
import MainAppBar from '../mainAppBar/mainAppBar.component';
import { ReduxDecorator } from './utils';
import { DaaasState } from '../state/state.types';

const placeHolderStyle = {
  height: 150,
  padding: 50,
  margin: 3,
  border: '2px dashed black',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const updateToBeLoggedIn = (state: DaaasState): DaaasState => {
  state.authorisation.loggedIn = true;
  return state;
};

const updateToBeLoggedOut = (state: DaaasState): DaaasState => {
  state.authorisation.loggedIn = false;
  return state;
};

storiesOf('MainAppBar', module)
  .addParameters({
    info: {
      text: 'This is the main app bar for the whole site.',
    },
  })
  .addDecorator(ReduxDecorator(updateToBeLoggedIn))
  .add('signed in', () => (
    <div style={{ marginTop: 30, marginLeft: 10, marginRight: 10 }}>
      <MainAppBar />
      <div style={{ display: 'flex' }}>
        <div style={{ width: 180, ...placeHolderStyle }}>Navigation</div>
        <div style={{ width: '100%', ...placeHolderStyle }}>Plugins here</div>
      </div>
    </div>
  ));

storiesOf('MainAppBar', module)
  .addDecorator(ReduxDecorator(updateToBeLoggedOut))
  .add('not signed in', () => (
    <div style={{ marginTop: 30, marginLeft: 10, marginRight: 10 }}>
      <MainAppBar />
      <div style={{ display: 'flex' }}>
        <div style={{ width: 180, ...placeHolderStyle }}>Navigation</div>
        <div style={{ width: '100%', ...placeHolderStyle }}>Plugins here</div>
      </div>
    </div>
  ));
