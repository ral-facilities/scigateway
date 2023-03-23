import React from 'react';
import { UnconnectedNavigationDrawer } from './navigationDrawer.component';

import { PluginConfig } from '../state/scigateway.types';
import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { MemoryRouter } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { buildTheme } from '../theming';
import { render, screen } from '@testing-library/react';

describe('Navigation drawer component', () => {
  let history: History;
  const theme = buildTheme(false);

  beforeEach(() => {
    history = createMemoryHistory();
    history.replace('/help');
  });

  function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
    return (
      <MemoryRouter>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </StyledEngineProvider>
      </MemoryRouter>
    );
  }

  it('Navigation drawer renders correctly when open', () => {
    const { asFragment } = render(
      <UnconnectedNavigationDrawer
        open
        plugins={[]}
        darkMode={false}
        res={undefined}
      />,
      { wrapper: Wrapper }
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('Navigation drawer renders correctly when closed', () => {
    const { asFragment } = render(
      <UnconnectedNavigationDrawer
        open={false}
        plugins={[]}
        darkMode={false}
        res={undefined}
      />,
      { wrapper: Wrapper }
    );

    expect(asFragment()).toMatchSnapshot();
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

    render(
      <UnconnectedNavigationDrawer
        open
        plugins={dummyPlugins}
        darkMode={false}
        res={undefined}
      />,
      { wrapper: Wrapper }
    );

    const navBarLinks = screen.getAllByRole('link');
    expect(navBarLinks).toHaveLength(6);

    expect(navBarLinks[0]).toHaveTextContent('analysis-plugin');
    expect(navBarLinks[1]).toHaveTextContent('analysis-plugin2');
    expect(navBarLinks[2]).toHaveTextContent('data-plugin');
    expect(navBarLinks[3]).toHaveTextContent('data-plugin1');
    expect(navBarLinks[4]).toHaveTextContent('data-plugin2');
    expect(navBarLinks[5]).toHaveTextContent('data-plugin-no-displayname');
  });

  it('does not render admin plugins or plugins that ask to hide in list', () => {
    const dummyPlugins: PluginConfig[] = [
      {
        order: 0,
        plugin: 'data-plugin',
        link: 'plugin_link',
        section: 'DATA',
        displayName: 'display name',
        admin: true,
      },
      {
        order: 1,
        plugin: 'data-plugin-2',
        link: 'plugin_link_2',
        section: 'DATA',
        displayName: 'display name 2',
        hideFromMenu: true,
      },
    ];

    render(
      <UnconnectedNavigationDrawer
        open
        plugins={dummyPlugins}
        darkMode={false}
        res={undefined}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('does not display link to homepage if a homepage link is set', () => {
    const homepageLink = 'homepage';
    const dummyPlugins: PluginConfig[] = [
      {
        order: 0,
        plugin: 'homepage-plugin',
        link: homepageLink,
        section: 'Homepage',
        displayName: 'home page',
      },
      {
        order: 1,
        plugin: 'data-plugin-no-displayname',
        link: 'plugin_link',
        section: 'DATA',
        displayName: 'display name',
      },
    ];

    render(
      <UnconnectedNavigationDrawer
        open
        plugins={dummyPlugins}
        darkMode={false}
        res={undefined}
        homepageUrl={homepageLink}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.queryByRole('link', { name: 'home page' })).toBeNull();
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

    render(
      <UnconnectedNavigationDrawer
        open
        darkMode
        plugins={dummyPlugins}
        res={undefined}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'stfc-logo-white-text.png'
    );
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
    const navigationDrawerLogo = {
      light: '/test/lightmode',
      dark: '/test/darkmode',
      altTxt: 'alt txt test',
    };

    const { rerender } = render(
      <UnconnectedNavigationDrawer
        open
        plugins={dummyPlugins}
        darkMode={false}
        res={undefined}
        navigationDrawerLogo={navigationDrawerLogo}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByAltText('alt txt test')).toHaveAttribute(
      'src',
      '/test/lightmode'
    );

    rerender(
      <UnconnectedNavigationDrawer
        open
        darkMode
        plugins={dummyPlugins}
        res={undefined}
        navigationDrawerLogo={navigationDrawerLogo}
      />
    );

    expect(screen.getByAltText('alt txt test')).toHaveAttribute(
      'src',
      '/test/darkmode'
    );
  });
});
