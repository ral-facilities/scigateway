import React from 'react';
import configureStore from 'redux-mock-store';
import { RouterState } from 'connected-react-router';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import NavigationDrawer from './navigationDrawer.component';
import { initialState } from '../state/reducers/daaas.reducer';
import { StateType } from '../state/state.types';
import { toggleDrawer } from '../state/actions/daaas.actions';
import { PluginConfig } from '../state/daaas.types';

describe('Main app bar component', () => {
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

  function buildPlugin(
    order: number,
    displayName: string,
    section: string
  ): PluginConfig {
    return {
      order: order,
      displayName: displayName,
      section: section,
      link: 'link',
      plugin: 'plugin',
    };
  }

  it('renders a plugin list grouped by section when open', () => {
    const dummyPlugins: PluginConfig[] = [
      buildPlugin(1, 'data-plugin', 'DATA'),
      buildPlugin(2, 'data-plugin2', 'DATA'),
      buildPlugin(2, 'data-plugin1', 'DATA'),
      buildPlugin(-1, 'analysis-plugin', 'ANALYSIS'),
    ];
    state.daaas.plugins = dummyPlugins;
    state.daaas.drawerOpen = true;

    const wrapper = shallow(<NavigationDrawer store={mockStore(state)} />);
    expect(wrapper.dive().dive()).toMatchSnapshot();
  });
});
