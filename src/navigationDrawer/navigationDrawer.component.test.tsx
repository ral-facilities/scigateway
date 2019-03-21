import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { initialState } from '../state/reducers/daaas.reducer';
import NavigationDrawer from './navigationDrawer.component';
import { toggleDrawer } from '../state/actions/daaas.actions';

describe('Main app bar component', () => {
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

  afterEach(() => {
    mount.cleanUp();
  });

  it('Navigation drawer renders correctly when open', () => {
    state.daaas.drawerOpen = true;

    const wrapper = shallow(<NavigationDrawer store={mockStore(state)} />);
    expect(wrapper.dive().dive()).toMatchSnapshot();
  });

  it('Navigation drawer renders correctly when closed', () => {
    state.daaas.drawerOpen = false;

    const wrapper = shallow(<NavigationDrawer store={mockStore(state)} />);
    expect(wrapper.dive().dive()).toMatchSnapshot();
  });

  it('sends toggleDrawer action when chevron clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(<NavigationDrawer store={testStore} />);

    wrapper
      .find('button')
      .first()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleDrawer());
  });
});
