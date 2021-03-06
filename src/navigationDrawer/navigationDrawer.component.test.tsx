import React from 'react';
import configureStore from 'redux-mock-store';
import { RouterState } from 'connected-react-router';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import NavigationDrawer from './navigationDrawer.component';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { StateType } from '../state/state.types';
import { toggleDrawer } from '../state/actions/scigateway.actions';
import { PluginConfig } from '../state/scigateway.types';
import { ListItemText } from '@material-ui/core';
import { MemoryRouter } from 'react-router';

describe('Navigation drawer component', () => {
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
    shallow = createShallow({ untilSelector: 'NavigationDrawer' });
    mount = createMount();
    mockStore = configureStore();
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { ...routerState },
    };
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('Navigation drawer renders correctly when open', () => {
    state.scigateway.drawerOpen = true;

    const wrapper = shallow(<NavigationDrawer store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Navigation drawer renders correctly when closed', () => {
    state.scigateway.drawerOpen = false;

    const wrapper = shallow(<NavigationDrawer store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sends toggleDrawer action when chevron clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(<NavigationDrawer store={testStore} />);

    wrapper.find('button').first().simulate('click');

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

  it('renders a plugin list grouped by sections ordered alphabetically when open', () => {
    const dummyPlugins: PluginConfig[] = [
      buildPlugin(1, 'data-plugin', 'DATA'),
      buildPlugin(2, 'data-plugin2', 'DATA'),
      buildPlugin(1, 'analysis-plugin2', 'ANALYSIS'),
      buildPlugin(2, 'data-plugin1', 'DATA'),
      buildPlugin(-1, 'analysis-plugin', 'ANALYSIS'),
      {
        order: 3,
        plugin: 'data-plugin-no-displayname',
        link: 'plugin_link',
        section: 'DATA',
      },
    ];
    state.scigateway.plugins = dummyPlugins;
    state.scigateway.drawerOpen = true;

    const wrapper = shallow(<NavigationDrawer store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();

    expect(wrapper.find('[to="plugin_link"]').first()).toMatchSnapshot();
  });

  it('does not render admin plugins in list', () => {
    const dummyPlugins: PluginConfig[] = [
      {
        order: 0,
        plugin: 'data-plugin',
        link: 'plugin_link',
        section: 'DATA',
        displayName: 'display name',
        admin: true,
      },
    ];

    state.scigateway.plugins = dummyPlugins;
    state.scigateway.drawerOpen = true;

    const wrapper = shallow(<NavigationDrawer store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('does not display link to homepage if a homepage link is set', () => {
    const homepageLink = 'homepage';
    const dummyPlugins: PluginConfig[] = [
      {
        order: 0,
        plugin: 'homepage-plugin',
        link: homepageLink,
        section: 'Homepage',
        displayName: 'display name',
      },
      {
        order: 1,
        plugin: 'data-plugin-no-displayname',
        link: 'plugin_link',
        section: 'DATA',
        displayName: 'display name',
      },
    ];
    state.scigateway.plugins = dummyPlugins;
    state.scigateway.drawerOpen = true;
    state.scigateway.homepageUrl = homepageLink;

    const wrapper = shallow(<NavigationDrawer store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();

    expect(wrapper.find('[to="homepage"]')).toEqual({});
  });

  it('renders a plugin', () => {
    const dummyPlugins: PluginConfig[] = [
      {
        order: 0,
        plugin: 'data-plugin',
        link: 'plugin_link',
        section: 'DATA',
        displayName: '\xa0display name',
      },
    ];
    state.scigateway.plugins = dummyPlugins;
    state.scigateway.drawerOpen = true;

    const testStore = mockStore(state);
    const wrapper = mount(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <NavigationDrawer store={testStore} />
      </MemoryRouter>
    );

    const listItemText = wrapper.find(ListItemText).last();
    expect(listItemText.text()).toEqual('\xa0display name');
  });

  it('renders the light mode logo at the top', () => {
    const dummyPlugins: PluginConfig[] = [
      {
        order: 0,
        plugin: 'data-plugin',
        link: 'plugin_link',
        section: 'DATA',
        displayName: '\xa0display name',
        logoAltText: 'DataGateway',
        logoDarkMode: '/darkLogo.svg',
        logoLightMode: '/lightLogo.svg',
      },
    ];
    state.scigateway.plugins = dummyPlugins;
    state.scigateway.drawerOpen = true;
    state.scigateway.darkMode = false;

    const testStore = mockStore(state);
    const wrapper = mount(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <NavigationDrawer store={testStore} />
      </MemoryRouter>
    );

    expect(wrapper.find('img')).toHaveLength(1);
    expect(wrapper.find('img').prop('src')).toEqual('/lightLogo.svg');
  });

  it('renders the dark mode logo at the top', () => {
    const dummyPlugins: PluginConfig[] = [
      {
        order: 0,
        plugin: 'data-plugin',
        link: 'plugin_link',
        section: 'DATA',
        displayName: '\xa0display name',
        logoAltText: 'DataGateway',
        logoDarkMode: '/darkLogo.svg',
        logoLightMode: '/lightLogo.svg',
      },
    ];
    state.scigateway.plugins = dummyPlugins;
    state.scigateway.drawerOpen = true;
    state.scigateway.darkMode = true;

    const testStore = mockStore(state);
    const wrapper = mount(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <NavigationDrawer store={testStore} />
      </MemoryRouter>
    );

    expect(wrapper.find('img')).toHaveLength(1);
    expect(wrapper.find('img').prop('src')).toEqual('/darkLogo.svg');
  });
});
