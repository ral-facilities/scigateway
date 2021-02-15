import React from 'react';
import Routing, { PluginPlaceHolder } from './routing.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import MaintenancePage from '../maintenancePage/maintenancePage.component';

// this removes a lot of unnecessary styling information in the snapshots
jest.mock('@material-ui/core/styles', () => ({
  withStyles: (styles) => (component) => component,
}));

describe('Routing component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  const classes = {
    container: 'container-class',
    containerShift: 'containerShift-class',
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();

    state = {
      scigateway: initialState,
      router: {
        action: 'POP',
        location: createLocation('/'),
      },
    };

    mockStore = configureStore();
  });

  it('renders component with no plugin routes', () => {
    state.scigateway.plugins = [];
    const wrapper = shallow(
      <Routing store={mockStore(state)} classes={classes} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders component with plugins', () => {
    state.scigateway.plugins = [
      {
        section: 'test section',
        link: 'test link',
        plugin: 'test_plugin_name',
        displayName: 'Test Plugin',
        order: 1,
      },
      {
        section: 'test section 2',
        link: 'test link 2',
        plugin: 'test_plugin_name_2',
        displayName: 'Test Plugin 2',
        order: 2,
      },
    ];
    const wrapper = shallow(
      <Routing store={mockStore(state)} classes={classes} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a route for a plugin', () => {
    state.scigateway.plugins = [
      {
        section: 'test section',
        link: '/test_link',
        plugin: 'test_plugin_name',
        displayName: 'Test Plugin',
        order: 1,
      },
    ];
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter
          initialEntries={[{ key: 'testKey', pathname: '/test_link' }]}
        >
          <Routing classes={classes} />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('does not render a route for a plugin when site is under maintenance', () => {
    const maintenancePageClasses = {
      root: 'root-class',
      container: 'container-class',
      titleText: 'titleText-class',
    };

    state.scigateway.maintenance = { show: true, message: 'test' };
    state.scigateway.plugins = [
      {
        section: 'test section',
        link: '/test_link',
        plugin: 'test_plugin_name',
        displayName: 'Test Plugin',
        order: 1,
      },
    ];
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter
          initialEntries={[{ key: 'testKey', pathname: '/test_link' }]}
        >
          <MaintenancePage classes={maintenancePageClasses} />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders placeholder for a plugin', () => {
    const wrapper = shallow(<PluginPlaceHolder id="test_id" />);
    expect(wrapper).toMatchSnapshot();
  });
});
