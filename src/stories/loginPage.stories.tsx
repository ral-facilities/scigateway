import React from 'react';
import { storiesOf } from '@storybook/react';
import { FakeAsyncAction } from './utils';
import { LoginPageWithStyles } from '../loginPage/loginPage.component';
import { storybookResourceStrings } from './storybookResourceStrings';
import { createLocation } from 'history';
import TestAuthProvider from '../authentication/testAuthProvider';
import { AuthProvider } from '../state/state.types';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

const buildLoginPage = (
  failedToLogin: boolean,
  loading: boolean,
  provider: AuthProvider
): React.ReactElement => (
  <LoginPageWithStyles
    verifyUsernameAndPassword={(u, p) =>
      FakeAsyncAction(`verify username and password: ${u},${p}`)()
    }
    auth={{
      failedToLogin,
      signedOutDueToTokenInvalidation: false,
      loading,
      provider,
    }}
    res={storybookResourceStrings.login}
    location={createLocation('/login')}
  />
);

const buildCredentialLoginPage = (
  failedToLogin: boolean,
  loading: boolean
): React.ReactElement => {
  const provider = new TestAuthProvider(null);
  return buildLoginPage(failedToLogin, loading, provider);
};

const buildRedirectLoginPage = (
  failedToLogin: boolean,
  loading: boolean
): React.ReactElement => {
  const provider = new TestAuthProvider(null);
  provider.redirectUrl = '/test-redirect-for-storybook';
  return buildLoginPage(failedToLogin, loading, provider);
};

const buildAnonLoginPage = (
  failedToLogin: boolean,
  loading: boolean
): React.ReactElement => {
  const provider = new TestAuthProvider(null);
  provider.mnemonic = 'anon';
  mock.onGet('/authenticators').reply(200, [
    {
      mnemonic: 'anon',
      keys: [],
    },
  ]);
  return buildLoginPage(failedToLogin, loading, provider);
};

const buildICATLoginPage = (
  failedToLogin: boolean,
  loading: boolean,
  mnemonic?: string
): React.ReactElement => {
  const provider = new TestAuthProvider(null);
  provider.mnemonic = mnemonic || '';
  mock.onGet('/authenticators').reply(200, [
    {
      mnemonic: 'user/pass',
      keys: [{ name: 'username' }, { name: 'password' }],
    },
    {
      mnemonic: 'anon',
      keys: [],
    },
  ]);
  return buildLoginPage(failedToLogin, loading, provider);
};

const buildSingleICATLoginPage = (
  failedToLogin: boolean,
  loading: boolean
): React.ReactElement => {
  const provider = new TestAuthProvider(null);
  provider.mnemonic = 'user/pass';
  mock.onGet('/authenticators').reply(200, [
    {
      mnemonic: 'user/pass',
      keys: [{ name: 'username' }, { name: 'password' }],
    },
  ]);
  return buildLoginPage(failedToLogin, loading, provider);
};

storiesOf('LoginPage/credentials', module)
  .addParameters({
    info: {
      text: 'This is the login page for the whole site.',
    },
  })
  .add('default', () => buildCredentialLoginPage(false, false))
  .add('loading', () => buildCredentialLoginPage(false, true))
  .add('unsuccessful', () => buildCredentialLoginPage(true, false));

storiesOf('LoginPage/redirect', module)
  .addParameters({
    info: {
      text: 'This is the login page for the whole site.',
    },
  })
  .add('default', () => buildRedirectLoginPage(false, false))
  .add('loading', () => buildRedirectLoginPage(false, true))
  .add('unsuccessful', () => buildRedirectLoginPage(true, false));

storiesOf('LoginPage/anonymous', module)
  .addParameters({
    info: {
      text: 'This is the login page for the whole site.',
    },
  })
  .add('default', () => buildAnonLoginPage(false, false))
  .add('loading', () => buildAnonLoginPage(false, true))
  .add('unsuccessful', () => buildAnonLoginPage(true, false));

storiesOf('LoginPage/multiple', module)
  .addParameters({
    info: {
      text: 'This is the login page for the whole site.',
    },
  })
  .add('single authenticator', () => buildSingleICATLoginPage(false, false))
  .add('no authenticator selected', () => buildICATLoginPage(false, false))
  .add('username/password selected', () =>
    buildICATLoginPage(false, false, 'user/pass')
  )
  .add('anon selected', () => buildICATLoginPage(false, false, 'anon'));
