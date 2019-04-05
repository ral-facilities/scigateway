import React from 'react';
import { LoginPageWithStyles } from './loginPage.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { initialState } from '../state/reducers/daaas.reducer';
import { RouterState } from 'connected-react-router';

describe('Login page component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;

  const routerState: RouterState = {
    action: 'POP',
    location: {
      hash: '',
      key: '',
      pathname: '/',
      search: '',
      state: {},
    },
  };

  beforeEach(() => {
    shallow = createShallow({});
    mount = createMount();

    mockStore = configureStore();

    state = {
      daaas: initialState,
      router: routerState,
    };
  });

  it('login page renders correctly', () => {
    const wrapper = shallow(
      <LoginPageWithStyles
        store={mockStore(state)}
        auth={state.daaas.authorisation}
      />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('on submit verification method should be called with username and password arguments', async () => {
    const mockLoginfn = jest.fn();
    const testStore = mockStore(state);

    const wrapper = mount(
      <LoginPageWithStyles
        verifyUsernameAndPassword={mockLoginfn}
        auth={state.daaas.authorisation}
        store={testStore}
      />
    );

    const simulateUsernameInput = wrapper.find('input').at(0);
    simulateUsernameInput.instance().value = 'new username';
    simulateUsernameInput.simulate('change');

    const simulatePasswordInput = wrapper.find('input').at(1);
    simulatePasswordInput.instance().value = 'new password';
    simulatePasswordInput.simulate('change');

    wrapper.find('button').simulate('click');

    expect(mockLoginfn.mock.calls.length).toEqual(1);

    expect(mockLoginfn.mock.calls[0]).toEqual(['new username', 'new password']);
  });
});
