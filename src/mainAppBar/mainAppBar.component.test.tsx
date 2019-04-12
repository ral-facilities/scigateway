import React from 'react';
import MainAppBarComponent from './mainAppBar.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { initialState } from '../state/reducers/daaas.reducer';
import { toggleDrawer } from '../state/actions/daaas.actions';
import { Provider } from 'react-redux';

describe('Main app bar component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({});
    mount = createMount();

    mockStore = configureStore();
    state = JSON.parse(JSON.stringify({ daaas: initialState }));
    state.daaas.authorisation.loggedIn = true;
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('app bar renders correctly', () => {
    const wrapper = shallow(<MainAppBarComponent store={mockStore(state)} />);
    expect(wrapper.dive().dive()).toMatchSnapshot();
  });

  it('does not render contact button when feature is false', () => {
    state.daaas.features.showContactButton = false;
    const wrapper = shallow(<MainAppBarComponent store={mockStore(state)} />);
    expect(wrapper.dive().dive()).toMatchSnapshot();
  });

  it('app bar indented when drawer is open', () => {
    state.daaas.drawerOpen = true;

    const wrapper = shallow(<MainAppBarComponent store={mockStore(state)} />);
    expect(wrapper.dive().dive()).toMatchSnapshot();
  });

  it('sends toggleDrawer action when menu clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MainAppBarComponent />
      </Provider>
    );

    wrapper
      .find('button')
      .first()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleDrawer());
  });
});
