import React from 'react';
import { mount, MountWrapper, shallow, ShallowWrapper } from 'enzyme';
import {
  UnconnectedNavigationDrawer,
  NavigationDrawerProps,
} from './navigationDrawer.component';

import { PluginConfig } from '../state/scigateway.types';
import {
  ListItemText,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/material';
import { MemoryRouter } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { buildTheme } from '../theming';

describe('Navigation drawer component', () => {
  let props: NavigationDrawerProps;
  let history: History;
  const theme = buildTheme(false);

  beforeEach(() => {
    history = createMemoryHistory();
    history.replace('/help');
  });

  const createShallowWrapper = (): ShallowWrapper =>
    shallow(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <UnconnectedNavigationDrawer {...props} />
        </ThemeProvider>
      </StyledEngineProvider>
    );

  const createWrapper = (): MountWrapper =>
    mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
            <UnconnectedNavigationDrawer {...props} />
          </MemoryRouter>
        </ThemeProvider>
      </StyledEngineProvider>
    );

  it('Navigation drawer renders correctly when open', () => {
    props = {
      open: true,
      plugins: [],
      res: undefined,
    };

    const wrapper = shallow(<UnconnectedNavigationDrawer {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Navigation drawer renders correctly when closed', () => {
    props = {
      open: false,
      plugins: [],
      res: undefined,
    };

    const wrapper = shallow(<UnconnectedNavigationDrawer {...props} />);
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
    };

    const wrapper = createShallowWrapper();
    const drawerWrapper = wrapper.find(UnconnectedNavigationDrawer).dive();

    expect(drawerWrapper).toMatchSnapshot();

    expect(drawerWrapper.find('[to="plugin_link"]').first()).toMatchSnapshot();
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
    };

    const wrapper = createShallowWrapper();
    const drawerWrapper = wrapper.find(UnconnectedNavigationDrawer).dive();

    expect(drawerWrapper).toMatchSnapshot();
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
      homepageUrl: homepageLink,
    };

    const wrapper = createShallowWrapper();
    const drawerWrapper = wrapper.find(UnconnectedNavigationDrawer).dive();

    expect(drawerWrapper).toMatchSnapshot();

    expect(drawerWrapper.find('[to="homepage"]')).toEqual({});
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
    };

    const wrapper = createWrapper();

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
      darkMode: false,
    };

    const wrapper = createWrapper();

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
      darkMode: true,
    };

    const wrapper = createWrapper();

    expect(wrapper.find('img')).toHaveLength(1);
    expect(wrapper.find('img').prop('src')).toEqual('stfc-logo-white-text.png');
  });
});
