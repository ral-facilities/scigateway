import React from 'react';
import UserProfileComponent from './userProfile.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { initialState } from '../state/reducers/scigateway.reducer';
import { Provider } from 'react-redux';
import { push } from 'connected-react-router';
import { Avatar } from '@material-ui/core';
import thunk from 'redux-thunk';
import TestAuthProvider from '../authentication/testAuthProvider';

describe('User profile component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();

    mockStore = configureStore([thunk]);
    state = JSON.parse(JSON.stringify({ scigateway: initialState }));
    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders sign in button if not signed in', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider(null);

    const wrapper = shallow(<UserProfileComponent store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders sign in button if user signed in via autoLogin', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
    state.scigateway.authorisation.provider.autoLogin = Promise.resolve();

    window.localStorage.__proto__.getItem = jest
      .fn()
      .mockImplementation(name => (name === 'autoLogin' ? 'true' : null));

    const wrapper = shallow(<UserProfileComponent store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
    expect(localStorage.getItem).toBeCalledWith('autoLogin');
  });

  it('redirects to login when sign in is pressed', () => {
    state.scigateway.authorisation.provider = new TestAuthProvider(null);

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <UserProfileComponent />
      </Provider>
    );

    wrapper
      .find('button')
      .first()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/login'));
  });

  it('renders default avatar if signed in', () => {
    const wrapper = shallow(<UserProfileComponent store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders user avatar if signed in with avatar url', () => {
    state.scigateway.authorisation.provider.user = {
      username: 'test',
      avatarUrl: 'test_url',
    };
    const wrapper = shallow(<UserProfileComponent store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('opens menu when button clicked', () => {
    state.scigateway.authorisation.provider.user = {
      username: 'test',
      avatarUrl: 'test_url',
    };
    const wrapper = mount(<UserProfileComponent store={mockStore(state)} />);

    expect(
      wrapper
        .find('#simple-menu')
        .first()
        .prop('open')
    ).toBeFalsy();

    wrapper.find(Avatar).simulate('click');

    expect(
      wrapper
        .find('#simple-menu')
        .first()
        .prop('open')
    ).toBeTruthy();
  });

  it('opens cookie policy/management page if manage cookies clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <UserProfileComponent />
      </Provider>
    );

    // Click the user menu button and click on the manage cookies menu item.
    wrapper.find('button').simulate('click');
    wrapper
      .find('#item-manage-cookies')
      .first()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/cookies'));
  });

  it('signs out if sign out clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <UserProfileComponent />
      </Provider>
    );

    // Click the user menu button and click on the sign out menu item.
    wrapper.find('button').simulate('click');
    wrapper
      .find('#item-sign-out')
      .first()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(2);
    expect(testStore.getActions()[0]).toEqual({ type: 'scigateway:signout' });
    expect(testStore.getActions()[1]).toEqual(push('/'));
  });
});
