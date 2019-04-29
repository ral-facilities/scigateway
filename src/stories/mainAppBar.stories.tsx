import React from 'react';
import { storiesOf } from '@storybook/react';
import MainAppBar from '../mainAppBar/mainAppBar.component';
import { ReduxDecorator } from './utils';
import { DaaasState, User } from '../state/state.types';
import UserInfo from '../authentication/user';
import TestAuthProvider from '../authentication/testAuthProvider';

const placeHolderStyle = {
  height: 150,
  padding: 50,
  margin: 3,
  border: '2px dashed black',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const user = new UserInfo('storybook-user');
user.avatarUrl =
  'https://avatars.dicebear.com/v2/jdenticon/3c0a7b089458bd2c8f5929b944050e73.svg';

type StateModifier = (state: DaaasState) => DaaasState;

const updateToBeLoggedIn = (user: User): StateModifier => state => {
  state.authorisation.provider = new TestAuthProvider('logged in');
  if (user) {
    state.authorisation.provider.user = user;
  }
  return state;
};

const updateToBeLoggedOut = (state: DaaasState): DaaasState => {
  state.authorisation.provider = new TestAuthProvider(null);
  return state;
};

const buildSignedInAppBar = (): React.ReactElement => (
  <div style={{ marginTop: 30, marginLeft: 10, marginRight: 10 }}>
    <MainAppBar />
    <div style={{ display: 'flex' }}>
      <div style={{ width: 180, ...placeHolderStyle }}>Navigation</div>
      <div style={{ width: '100%', ...placeHolderStyle }}>Plugins here</div>
    </div>
  </div>
);

storiesOf('MainAppBar', module)
  .addParameters({
    info: {
      text: 'This is the main app bar for the whole site.',
    },
  })
  .addDecorator(
    ReduxDecorator(updateToBeLoggedIn(new UserInfo('storybook-user')))
  )
  .add('signed in', () => buildSignedInAppBar());

storiesOf('MainAppBar', module)
  .addDecorator(ReduxDecorator(updateToBeLoggedIn(user)))
  .add('signed in with avatar', () => buildSignedInAppBar());

storiesOf('MainAppBar', module)
  .addDecorator(ReduxDecorator(updateToBeLoggedOut))
  .add('not signed in', () => buildSignedInAppBar());
