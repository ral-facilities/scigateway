import React from 'react';
import UserProfileComponent from './userProfile.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { initialState } from '../state/reducers/daaas.reducer';
import { Provider } from 'react-redux';
import { push } from 'connected-react-router';
import { MenuItem } from '@material-ui/core';
import thunk from 'redux-thunk';

describe('User profile component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({});
    mount = createMount();

    mockStore = configureStore([thunk]);
    state = JSON.parse(JSON.stringify({ daaas: initialState }));
    state.daaas.authorisation.loggedIn = true;
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders sign in button if not signed in', () => {
    state.daaas.authorisation.loggedIn = false;

    const wrapper = shallow(<UserProfileComponent store={mockStore(state)} />);
    expect(wrapper.dive().dive()).toMatchSnapshot();
  });

  it('redirects to login when sign in is pressed', () => {
    state.daaas.authorisation.loggedIn = false;

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

  it('renders avatar if signed in', () => {
    const wrapper = shallow(<UserProfileComponent store={mockStore(state)} />);
    expect(wrapper.dive().dive()).toMatchSnapshot();
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
