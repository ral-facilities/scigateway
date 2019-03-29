import React from 'react';
import LoginPageComponent from './loginPage.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { initialState } from '../state/reducers/daaas.reducer';
import { verifyUsernameAndPassword } from '../state/actions/daaas.actions';

describe('Login page component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({});
    mount = createMount();

    mockStore = configureStore();
    state = {
      daaas: initialState,
    };
  });

  it('login page renders correctly', () => {
    const wrapper = shallow(<LoginPageComponent store={mockStore(state)} />);
    expect(wrapper.dive().dive()).toMatchSnapshot();
  });

  it('renders a username input', () => {
    const testStore = mockStore(state);
    const wrapper = mount(<LoginPageComponent store={testStore} />);

    const simulateUsernameInput = wrapper.find('input').at(0);
    simulateUsernameInput.instance().value = 'new username';
    simulateUsernameInput.simulate('change');

    const simulatePasswordInput = wrapper.find('input').at(1);
    simulatePasswordInput.instance().value = 'new password';
    simulatePasswordInput.simulate('change');

    wrapper.find('button').simulate('click');

    expect(testStore.getActions().length).toEqual(1);

    expect(testStore.getActions()[0]).toEqual(
      verifyUsernameAndPassword('new username', 'new password')
    );
  });
});
