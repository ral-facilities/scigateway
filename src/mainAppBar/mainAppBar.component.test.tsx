import React from 'react';
import MainAppBarComponent from './mainAppBar.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { push } from 'connected-react-router';
import { initialState } from '../state/reducers/scigateway.reducer';
import { toggleDrawer, toggleHelp } from '../state/actions/scigateway.actions';
import { Provider } from 'react-redux';
import TestAuthProvider from '../authentication/testAuthProvider';
import { buildTheme } from '../theming';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { loadDarkModePreference } from '../state/actions/scigateway.actions';

describe('Main app bar component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();

    mockStore = configureStore();
    state = JSON.parse(JSON.stringify({ scigateway: initialState }));
    state.scigateway.authorisation.provider = new TestAuthProvider('token123');
  });

  afterEach(() => {
    mount.cleanUp();
  });

  const theme = buildTheme(false);

  it('app bar renders correctly', () => {
    const wrapper = shallow(<MainAppBarComponent store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render contact button when feature is false', () => {
    state.scigateway.features.showContactButton = false;
    const wrapper = shallow(<MainAppBarComponent store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('app bar indented when drawer is open', () => {
    state.scigateway.drawerOpen = true;

    const wrapper = shallow(<MainAppBarComponent store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sends toggleDrawer action when menu clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <Provider store={testStore}>
          <MainAppBarComponent />
        </Provider>
      </MuiThemeProvider>
    );

    wrapper.find('button').first().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleDrawer());
  });

  it('redirects to base url when title clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <Provider store={testStore}>
          <MainAppBarComponent />
        </Provider>
      </MuiThemeProvider>
    );

    wrapper.find('button[aria-label="Homepage"]').first().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/'));
  });

  it('redirects to Contact page when Contact button clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <Provider store={testStore}>
          <MainAppBarComponent />
        </Provider>
      </MuiThemeProvider>
    );

    wrapper.find('button[aria-label="Contactpage"]').first().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/contact'));
  });

  it('sends toggleHelp action when help button is clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <Provider store={testStore}>
          <MainAppBarComponent />
        </Provider>
      </MuiThemeProvider>
    );

    wrapper.find('button[aria-label="Help"]').first().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleHelp());
  });

  it('opens settings when button clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <Provider store={testStore}>
          <MainAppBarComponent />
        </Provider>
      </MuiThemeProvider>
    );

    expect(wrapper.find('#settings').first().prop('open')).toBeFalsy();

    wrapper
      .find('button[aria-label="Open browser settings"]')
      .simulate('click');

    expect(wrapper.find('#settings').first().prop('open')).toBeTruthy();
  });

  it('opens cookie policy/management page if manage cookies clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <Provider store={testStore}>
          <MainAppBarComponent />
        </Provider>
      </MuiThemeProvider>
    );

    // Click the user menu button and click on the manage cookies menu item.
    wrapper
      .find('button[aria-label="Open browser settings"]')
      .simulate('click');
    wrapper.find('#item-manage-cookies').first().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/cookies'));
  });

  it('sends load dark mode prefrence action if toggle dark mode is clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <Provider store={testStore}>
          <MainAppBarComponent />
        </Provider>
      </MuiThemeProvider>
    );

    // Click the user menu button and click on the manage cookies menu item.
    wrapper
      .find('button[aria-label="Open browser settings"]')
      .simulate('click');
    wrapper.find('#item-dark-mode').first().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(loadDarkModePreference(true));
  });
});
