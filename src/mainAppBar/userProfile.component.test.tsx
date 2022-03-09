import React from 'react';
import UserProfileComponent from './userProfile.component';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { Provider } from 'react-redux';
import { push } from 'connected-react-router';
import { ThemeProvider, StyledEngineProvider } from '@mui/material';
import thunk from 'redux-thunk';
import TestAuthProvider from '../authentication/testAuthProvider';
import { buildTheme } from '../theming';
import { mount, shallow, ShallowWrapper } from 'enzyme';

describe('User profile component', () => {
  let mockStore;
  let state: StateType;
  const theme = buildTheme(false);

  beforeEach(() => {
    mockStore = configureStore([thunk]);
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
    };
    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );
  });

  const createShallowWrapper = (): ShallowWrapper => {
    return shallow(<UserProfileComponent store={mockStore(state)} />)
      .dive()
      .dive();
  };

  it('renders sign in button if not signed in', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider(null);

    const wrapper = createShallowWrapper();
    expect(wrapper).toMatchSnapshot();
  });

  it('redirects to login when sign in is pressed', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider(null);

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <UserProfileComponent />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    wrapper.find('button').first().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/login'));
  });

  it('renders sign in button if user signed in via autoLogin', () => {
    state.scigateway.authorisation.provider.autoLogin = () => Promise.resolve();

    window.localStorage.__proto__.getItem = jest
      .fn()
      .mockImplementation((name) => (name === 'autoLogin' ? 'true' : null));

    const wrapper = createShallowWrapper();

    expect(wrapper).toMatchSnapshot();
    expect(localStorage.getItem).toBeCalledWith('autoLogin');
  });

  it('renders default avatar if signed in', () => {
    const wrapper = createShallowWrapper();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders user avatar if signed in with avatar url', () => {
    state.scigateway.authorisation.provider.user = {
      username: 'test',
      avatarUrl: 'test_url',
    };
    const wrapper = createShallowWrapper();
    expect(wrapper).toMatchSnapshot();
  });

  it('opens menu when button clicked', () => {
    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <UserProfileComponent store={mockStore(state)} />
        </ThemeProvider>
      </StyledEngineProvider>
    );

    expect(wrapper.find('#simple-menu').first().prop('open')).toBeFalsy();

    wrapper.find('button').simulate('click');

    expect(wrapper.find('#simple-menu').first().prop('open')).toBeTruthy();
  });

  it('signs out if sign out clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <UserProfileComponent />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    // Click the user menu button and click on the sign out menu item.
    wrapper.find('button').simulate('click');
    wrapper.find('#item-sign-out').last().simulate('click');

    expect(testStore.getActions().length).toEqual(2);
    expect(testStore.getActions()[0]).toEqual({ type: 'scigateway:signout' });
    expect(testStore.getActions()[1]).toEqual(push('/'));
  });
});
