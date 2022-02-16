import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import {
  NavigationDrawerWithoutStyles,
  CombinedNavigationProps,
} from './navigationDrawer.component';

import { PluginConfig } from '../state/scigateway.types';
import { ListItemText } from '@material-ui/core';
import { MemoryRouter } from 'react-router';
import { createMemoryHistory, History } from 'history';
import { ReactWrapper } from 'enzyme';

describe('Navigation drawer component', () => {
  let shallow;
  let mount;
  let props: CombinedNavigationProps;
  let history: History;

  const dummyClasses = {
    root: 'root-1',
    drawer: 'drawer-1',
    drawerPaper: 'drawerPaper-1',
    sectionTitle: 'sectionTitle-1',
    menuItem: 'menuItem-1',
    menuLogo: 'menuLogo-1',
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'NavigationDrawer' });
    mount = createMount();
    history = createMemoryHistory();
    history.replace('/help');
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('Navigation drawer renders correctly when open', () => {
    props = {
      open: true,
      plugins: [],
      res: undefined,
      classes: dummyClasses,
    };

    const wrapper = shallow(<NavigationDrawerWithoutStyles {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Navigation drawer renders correctly when closed', () => {
    props = {
      open: false,
      plugins: [],
      res: undefined,
      classes: dummyClasses,
    };

    const wrapper = shallow(<NavigationDrawerWithoutStyles {...props} />);
    expect(wrapper).toMatchSnapshot();
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

    props = {
      open: true,
      plugins: dummyPlugins,
      res: undefined,
      classes: dummyClasses,
    };

    const wrapper = shallow(<NavigationDrawerWithoutStyles {...props} />);

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

    props = {
      open: true,
      plugins: dummyPlugins,
      res: undefined,
      classes: dummyClasses,
    };

    const wrapper = shallow(<NavigationDrawerWithoutStyles {...props} />);

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

    props = {
      open: true,
      plugins: dummyPlugins,
      res: undefined,
      classes: dummyClasses,
      homepageUrl: homepageLink,
    };

    const wrapper = shallow(<NavigationDrawerWithoutStyles {...props} />);

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

    props = {
      open: true,
      plugins: dummyPlugins,
      res: undefined,
      classes: dummyClasses,
    };

    const wrapper = mount(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <NavigationDrawerWithoutStyles {...props} />
      </MemoryRouter>
    );

    const listItemText = wrapper.find(ListItemText).last();
    expect(listItemText.text()).toEqual('\xa0display name');
  });

  it('renders the light mode logo at the bottom', () => {
    const dummyPlugins: PluginConfig[] = [
      {
        order: 0,
        plugin: 'data-plugin',
        link: 'plugin_link',
        section: 'DATA',
        displayName: '\xa0display name',
      },
    ];

    props = {
      open: true,
      plugins: dummyPlugins,
      res: undefined,
      classes: dummyClasses,
      darkMode: false,
    };

    const wrapper = mount(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <NavigationDrawerWithoutStyles {...props} />
      </MemoryRouter>
    );

    expect(wrapper.find('img')).toHaveLength(1);
    expect(wrapper.find('img').prop('src')).toEqual('stfc-logo-blue-text.png');
  });

  it('renders the dark mode logo at the top', () => {
    const dummyPlugins: PluginConfig[] = [
      {
        order: 0,
        plugin: 'data-plugin',
        link: 'plugin_link',
        section: 'DATA',
        displayName: '\xa0display name',
      },
    ];
    props = {
      open: true,
      plugins: dummyPlugins,
      res: undefined,
      classes: dummyClasses,
      darkMode: true,
    };

    const wrapper = mount(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <NavigationDrawerWithoutStyles {...props} />
      </MemoryRouter>
    );

    expect(wrapper.find('img')).toHaveLength(1);
    expect(wrapper.find('img').prop('src')).toEqual('stfc-logo-white-text.png');
  });
  it('should be able to use logo set in the settings file', () => {
    const dummyPlugins: PluginConfig[] = [
      {
        order: 0,
        plugin: 'data-plugin',
        link: 'plugin_link',
        section: 'DATA',
        displayName: '\xa0display name',
      },
    ];

    const createWrapper = (props: CombinedNavigationProps): ReactWrapper => {
      return mount(
        <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
          <NavigationDrawerWithoutStyles {...props} />
        </MemoryRouter>
      );
    };
    // darkmode
    props = {
      open: true,
      plugins: dummyPlugins,
      res: undefined,
      classes: dummyClasses,
      darkMode: true,
      navigationDrawerLogo: {
        light: '/test/lightmode',
        dark: '/test/darkmode',
        altTxt: 'alt txt test',
      },
    };

    let wrapper = createWrapper(props);

    expect(wrapper.find('img').props().src).toEqual('/test/darkmode');
    expect(wrapper.find('img').props().alt).toEqual('alt txt test');

    // lightmode
    props = {
      open: true,
      plugins: dummyPlugins,
      res: undefined,
      classes: dummyClasses,
      darkMode: false,
      navigationDrawerLogo: {
        light: '/test/lightmode',
        dark: '/test/darkmode',
        altTxt: 'alt txt test',
      },
    };

    wrapper = createWrapper(props);

    expect(wrapper.find('img').props().src).toEqual('/test/lightmode');
    expect(wrapper.find('img').props().alt).toEqual('alt txt test');

    // Defaults to stfc logo when there is a value for lightmode but
    // no value for dark mode

    props = {
      open: true,
      plugins: dummyPlugins,
      res: undefined,
      classes: dummyClasses,
      darkMode: true,
      navigationDrawerLogo: {
        light: '/test/lightmode',
        dark: '',
        altTxt: 'alt txt test',
      },
    };

    wrapper = createWrapper(props);

    expect(wrapper.find('img').props().src).toEqual('stfc-logo-white-text.png');
    expect(wrapper.find('img').props().alt).toEqual('alternative-text');

    // Defaults to stfc logo when there is a value for lightmode but
    // no value for dark mode

    props = {
      open: true,
      plugins: dummyPlugins,
      res: undefined,
      classes: dummyClasses,
      darkMode: false,
      navigationDrawerLogo: {
        light: '',
        dark: '/test/darkmode',
        altTxt: 'alt txt test',
      },
    };

    wrapper = createWrapper(props);

    expect(wrapper.find('img').props().src).toEqual('stfc-logo-blue-text.png');
    expect(wrapper.find('img').props().alt).toEqual('alternative-text');
  });
});
