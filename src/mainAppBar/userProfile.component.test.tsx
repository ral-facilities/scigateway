import React from 'react';
import UserProfileComponent from './userProfile.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { initialState } from '../state/reducers/daaas.reducer';
import { Provider } from 'react-redux';
import { push } from 'connected-react-router';
import { MenuItem, Avatar } from '@material-ui/core';
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
    state = JSON.parse(JSON.stringify({ daaas: initialState }));
    state.daaas.authorisation.provider = new TestAuthProvider('test-token');
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders sign in button if not signed in', () => {
    state.daaas.authorisation.provider = new TestAuthProvider(null);

    const wrapper = shallow(<UserProfileComponent store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('redirects to login when sign in is pressed', () => {
    state.daaas.authorisation.provider = new TestAuthProvider(null);

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
    state.daaas.authorisation.provider.user = {
      username: 'test',
      avatarUrl: 'test_url',
    };
    const wrapper = shallow(<UserProfileComponent store={mockStore(state)} />);
    expect(wrapper.dive().dive()).toMatchSnapshot();
  });

  it('opens menu when button clicked', () => {
    state.daaas.authorisation.provider.user = {
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

  it('signs out if sign out clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <UserProfileComponent />
      </Provider>
    );

    wrapper.find('button').simulate('click');
    wrapper.find(MenuItem).simulate('click');

    expect(testStore.getActions().length).toEqual(2);
    expect(testStore.getActions()[0]).toEqual({ type: 'daaas:signout' });
    expect(testStore.getActions()[1]).toEqual(push('/'));
  });
});
