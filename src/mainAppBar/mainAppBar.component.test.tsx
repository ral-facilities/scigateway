import React from 'react';
import MainAppBarComponent from './mainAppBar.component';
import { createLocation } from 'history';
import { StateType } from '../state/state.types';
import { PluginConfig } from '../state/scigateway.types';
import configureStore from 'redux-mock-store';
import { push } from 'connected-react-router';
import { initialState } from '../state/reducers/scigateway.reducer';
import {
  loadHighContrastModePreference,
  toggleDrawer,
  toggleHelp,
} from '../state/actions/scigateway.actions';
import { Provider } from 'react-redux';
import TestAuthProvider from '../authentication/testAuthProvider';
import { buildTheme } from '../theming';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { loadDarkModePreference } from '../state/actions/scigateway.actions';
import { createMemoryHistory, History } from 'history';
import { ReactWrapper, mount } from 'enzyme';
import { Router } from 'react-router-dom';
import ScigatewayLogo from '../images/scigateway-white-text-blue-mark-logo.svg';

describe('Main app bar component', () => {
  let mockStore;
  let state: StateType;
  let history: History;

  const createWrapper = (testStore): ReactWrapper => {
    return mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={testStore}>
            <Router history={history}>
              <MainAppBarComponent />
            </Router>
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  };

  beforeEach(() => {
    history = createMemoryHistory();

    mockStore = configureStore();
    state = {
      scigateway: {
        ...initialState,
        features: { ...initialState.features, showHelpPageButton: true },
      },
      router: { location: createLocation('/') },
    };
    state.scigateway.authorisation.provider = new TestAuthProvider('token123');
  });

  const theme = buildTheme(false);

  it('app bar renders correctly', () => {
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);
    expect(wrapper.find('MainAppBar').props()).toMatchSnapshot();
  });

  it('does not render Help button when feature is false', () => {
    state.scigateway.features.showHelpPageButton = false;
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);
    expect(wrapper.find('MainAppBar').props()).toMatchSnapshot();
  });

  it('uses single plugin logo when feature is true', () => {
    state.scigateway.features.singlePluginLogo = true;
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);
    expect(wrapper.find('MainAppBar').props()).toMatchSnapshot();
  });

  it('app bar indented when drawer is open', () => {
    state.scigateway.drawerOpen = true;
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);
    expect(wrapper.find('MainAppBar').props()).toMatchSnapshot();
  });

  it('sends toggleDrawer action when site has loaded', () => {
    state.scigateway.drawerOpen = false;
    state.scigateway.siteLoading = false;
    const testStore = mockStore(state);
    createWrapper(testStore);

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleDrawer());
  });

  it('sends toggleDrawer action when menu clicked (open drawer)', () => {
    state.scigateway.drawerOpen = true;
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);

    wrapper.find('button').first().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleDrawer());
  });

  it('sends toggleDrawer action when menu clicked (close drawer)', () => {
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);

    wrapper.find('button').first().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleDrawer());
  });

  it('redirects to base url when title clicked', () => {
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);

    wrapper.find('button[aria-label="home-page"]').first().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/'));
  });

  it('redirects to Help page when Help button clicked', () => {
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);

    wrapper.find('button[aria-label="help-page"]').first().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/help'));
  });

  it('redirects to Admin page when Admin button clicked (maintenance is default)', () => {
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);

    wrapper.find('button[aria-label="admin-page"]').first().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/admin/maintenance'));
  });

  it('redirects to Admin page when Admin button clicked (download is default)', () => {
    state.scigateway.adminPageDefaultTab = 'download';
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);

    wrapper.find('button[aria-label="admin-page"]').first().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/admin/download'));
  });

  it('sends toggleHelp action when help button is clicked', () => {
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);

    wrapper.find('button[aria-label="help"]').first().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleHelp());
  });

  it('opens settings when button clicked', () => {
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);

    expect(wrapper.find('#settings').first().prop('open')).toBeFalsy();

    wrapper
      .find('button[aria-label="open-browser-settings"]')
      .simulate('click');

    expect(wrapper.find('#settings').first().prop('open')).toBeTruthy();

    expect(wrapper.find('#item-dark-mode').first().text()).toEqual(
      'switch-dark-mode'
    );
    expect(wrapper.find('#item-high-contrast-mode').first().text()).toEqual(
      'switch-high-contrast-on'
    );
  });

  it('settings display correctly when dark and high contrast modes are enabled', () => {
    state.scigateway.darkMode = true;
    state.scigateway.highContrastMode = true;
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);

    expect(wrapper.find('#settings').first().prop('open')).toBeFalsy();

    wrapper
      .find('button[aria-label="open-browser-settings"]')
      .simulate('click');

    expect(wrapper.find('#settings').first().prop('open')).toBeTruthy();

    expect(wrapper.find('#item-dark-mode').first().text()).toEqual(
      'switch-light-mode'
    );
    expect(wrapper.find('#item-high-contrast-mode').first().text()).toEqual(
      'switch-high-contrast-off'
    );
  });

  it('opens cookie policy/management page if manage cookies clicked', () => {
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);

    // Click the user menu button and click on the manage cookies menu item.
    wrapper
      .find('button[aria-label="open-browser-settings"]')
      .simulate('click');
    wrapper.find('#item-manage-cookies').last().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/cookies'));
  });

  it('sends load dark mode prefrence action if toggle dark mode is clicked', () => {
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);

    // Click the user menu button and click on the manage cookies menu item.
    wrapper
      .find('button[aria-label="open-browser-settings"]')
      .simulate('click');
    wrapper.find('#item-dark-mode').last().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(loadDarkModePreference(true));
  });

  it('sends load high contrast mode prefrence action if toggle high contrast mode is clicked', () => {
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);

    // Click the user menu button and click on the manage cookies menu item.
    wrapper
      .find('button[aria-label="open-browser-settings"]')
      .simulate('click');
    wrapper.find('#item-high-contrast-mode').last().simulate('click');
    wrapper.update();

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(
      loadHighContrastModePreference(true)
    );
  });

  it('sets plugin logo', () => {
    const plugin: PluginConfig = {
      section: 'section',
      link: '/link',
      plugin: 'plugin',
      displayName: 'pluginName',
      order: 1,
      logoDarkMode: 'pluginLogo',
    };
    state.scigateway.plugins = [plugin];
    state.scigateway.siteLoading = false;

    const testStore = mockStore(state);
    // Need to attachTo something to ensure document.getElementById works as expected
    // https://stackoverflow.com/questions/43694975/jest-enzyme-using-mount-document-getelementbyid-returns-null-on-componen
    const holder = document.createElement('div');
    document.body.appendChild(holder);
    const wrapper = mount(
      <div id="plugin">
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <Provider store={testStore}>
              <Router history={history}>
                <MainAppBarComponent />
              </Router>
            </Provider>
          </ThemeProvider>
        </StyledEngineProvider>
      </div>,
      { attachTo: holder }
    );

    expect(wrapper.find('img').prop('src')).toEqual('pluginLogo');
  });

  it('sets Scigateway logo if no plugins are loaded or no plugins match found plugin or if plugin does not provide logo', () => {
    let testStore = mockStore(state);
    let wrapper = createWrapper(testStore);
    expect(wrapper.find('img').prop('src')).toEqual(ScigatewayLogo);

    let plugin: PluginConfig = {
      section: 'section',
      link: '/link',
      plugin: 'plugin1',
      displayName: 'pluginName',
      order: 1,
      logoDarkMode: 'pluginLogo',
    };
    state.scigateway.plugins = [plugin];

    testStore = mockStore(state);
    wrapper = mount(
      <div id="plugin2">
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <Provider store={testStore}>
              <Router history={history}>
                <MainAppBarComponent />
              </Router>
            </Provider>
          </ThemeProvider>
        </StyledEngineProvider>
      </div>
    );

    expect(wrapper.find('img').prop('src')).toEqual(ScigatewayLogo);

    plugin = {
      section: 'section',
      link: '/link',
      plugin: 'plugin',
      displayName: 'pluginName',
      order: 1,
    };
    state.scigateway.plugins = [plugin];

    testStore = mockStore(state);
    wrapper = mount(
      <div id="plugin">
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <Provider store={testStore}>
              <Router history={history}>
                <MainAppBarComponent />
              </Router>
            </Provider>
          </ThemeProvider>
        </StyledEngineProvider>
      </div>
    );

    expect(wrapper.find('img').prop('src')).toEqual(ScigatewayLogo);
  });

  it('sets first plugin logo when the singlePluginLogo setting is true', () => {
    let testStore = mockStore(state);
    let wrapper = createWrapper(testStore);
    expect(wrapper.find('img').prop('src')).toEqual(ScigatewayLogo);

    state.scigateway.features.singlePluginLogo = true;
    state.scigateway.plugins = [
      {
        section: 'section',
        link: '/link',
        plugin: 'plugin1',
        displayName: 'pluginName',
        order: 1,
        logoDarkMode: 'pluginLogo',
      },
      {
        section: 'section',
        link: '/link',
        plugin: 'plugin2',
        displayName: 'pluginName',
        order: 2,
        logoDarkMode: 'pluginLogo2',
      },
    ];
    state.scigateway.siteLoading = false;

    testStore = mockStore(state);
    wrapper = mount(
      <div id="plugin2">
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <Provider store={testStore}>
              <Router history={history}>
                <MainAppBarComponent />
              </Router>
            </Provider>
          </ThemeProvider>
        </StyledEngineProvider>
      </div>
    );

    expect(wrapper.find('img').prop('src')).toEqual('pluginLogo');
  });

  it('opens no notifications message if alert icon clicked and there are no alerts', () => {
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);

    //Check notification only opens when clicked
    expect(
      wrapper.find('[aria-label="No notifications message"]').exists()
    ).toBeFalsy();

    wrapper
      .find('button[aria-label="Open notification menu"]')
      .simulate('click');

    expect(
      wrapper.find('[aria-label="No notifications message"]').exists()
    ).toBeTruthy();
  });
});
