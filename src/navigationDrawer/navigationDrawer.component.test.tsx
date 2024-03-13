import * as React from 'react';
import { NavigationDrawer } from './navigationDrawer.component';

import { PluginConfig } from '../state/scigateway.types';
import {
  StyledEngineProvider,
  ThemeProvider,
  useMediaQuery,
} from '@mui/material';
import { MemoryRouter } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { buildTheme } from '../theming';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { combineReducers, createStore, Store } from 'redux';
import { ScigatewayState, StateType } from '../state/state.types';
import ScigatewayReducer, {
  initialState as scigatewayInitialState,
} from '../state/reducers/scigateway.reducer';

vi.mock('@mui/material', () => ({
  __esmodule: true,
  ...jest.requireActual('@mui/material'),
  useMediaQuery: vi.fn(),
}));

describe('Navigation drawer component', () => {
  let history: History;
  const theme = buildTheme(false);

  beforeEach(() => {
    history = createMemoryHistory();
    history.replace('/help');
    // I don't think MediaQuery works properly in jest
    // in the implementation useMediaQuery is used to query whether the current viewport is md or larger
    // here we assume it is always the case.
    vi.mocked(useMediaQuery).mockReturnValue(true);
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

  function createMockStore(initialState: Partial<ScigatewayState>): Store {
    return createStore(
      combineReducers<Partial<StateType>>({
        scigateway: (
          state = { ...scigatewayInitialState, ...initialState },
          action
        ) => ScigatewayReducer(state, action),
      })
    );
  }

  it('Navigation drawer renders correctly when open', () => {
    const { asFragment } = render(
      <Provider
        store={createMockStore({
          drawerOpen: true,
          plugins: [],
          darkMode: false,
          res: undefined,
        })}
      >
        <NavigationDrawer />
      </Provider>,
      { wrapper: Wrapper }
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('Navigation drawer renders correctly when closed', () => {
    const { asFragment } = render(
      <Provider
        store={createMockStore({
          drawerOpen: false,
          plugins: [],
          darkMode: false,
          res: undefined,
        })}
      >
        <NavigationDrawer />
      </Provider>,
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
      <Provider
        store={createMockStore({
          drawerOpen: true,
          plugins: dummyPlugins,
          darkMode: false,
          res: undefined,
        })}
      >
        <NavigationDrawer />
      </Provider>,
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
      <Provider
        store={createMockStore({
          drawerOpen: true,
          plugins: dummyPlugins,
          darkMode: false,
          res: undefined,
        })}
      >
        <NavigationDrawer />
      </Provider>,
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
      <Provider
        store={createMockStore({
          drawerOpen: true,
          plugins: dummyPlugins,
          darkMode: false,
          res: undefined,
          homepageUrl: homepageLink,
        })}
      >
        <NavigationDrawer />
      </Provider>,
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
      <Provider
        store={createMockStore({
          drawerOpen: true,
          plugins: dummyPlugins,
          darkMode: true,
          res: undefined,
        })}
      >
        <NavigationDrawer />
      </Provider>,
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
      <Provider
        store={createMockStore({
          navigationDrawerLogo,
          drawerOpen: true,
          plugins: dummyPlugins,
          darkMode: false,
          res: undefined,
        })}
      >
        <NavigationDrawer />
      </Provider>,
      { wrapper: Wrapper }
    );

    expect(screen.getByAltText('alt txt test')).toHaveAttribute(
      'src',
      '/test/lightmode'
    );

    rerender(
      <Provider
        store={createMockStore({
          navigationDrawerLogo,
          drawerOpen: true,
          plugins: dummyPlugins,
          darkMode: true,
          res: undefined,
        })}
      >
        <NavigationDrawer />
      </Provider>
    );

    expect(screen.getByAltText('alt txt test')).toHaveAttribute(
      'src',
      '/test/darkmode'
    );
  });
});
