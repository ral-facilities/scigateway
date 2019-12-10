import React from 'react';
import CookieConsent from './cookieConsent.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { initialState } from '../state/reducers/scigateway.reducer';
import { initialiseAnalytics } from '../state/actions/scigateway.actions';
import { Provider } from 'react-redux';
import { buildTheme } from '../theming';
import { MuiThemeProvider } from '@material-ui/core';
import Cookies from 'js-cookie';
import ReactGA from 'react-ga';
import { createLocation } from 'history';
import { push } from 'connected-react-router';

describe('Cookie consent component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'CookieConsent' });
    mount = createMount();

    mockStore = configureStore();
    state = JSON.parse(
      JSON.stringify({
        scigateway: initialState,
        router: { location: createLocation('/') },
      })
    );
    state.scigateway.siteLoading = false;
    state.scigateway.analytics = {
      id: 'test id',
      initialised: false,
    };
  });

  afterEach(() => {
    mount.cleanUp();
  });

  const theme = buildTheme();

  it('should render correctly', () => {
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <CookieConsent store={mockStore(state)} />
      </MuiThemeProvider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should navigate to cookie page on user clicking manage preferences', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <Provider store={testStore}>
          <CookieConsent />
        </Provider>
      </MuiThemeProvider>
    );

    wrapper
      .find('button')
      .first()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/cookies'));
  });

  it('should set cookie to true upon user accept', () => {
    Cookies.set = jest.fn();
    const testStore = mockStore(state);
    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <Provider store={testStore}>
          <CookieConsent />
        </Provider>
      </MuiThemeProvider>
    );

    wrapper
      .find('button')
      .last()
      .simulate('click');

    expect(Cookies.set).toHaveBeenCalled();
    const mockCookies = (Cookies.set as jest.Mock).mock;
    const callArguments = mockCookies.calls[0];
    expect(callArguments[0]).toEqual('cookie-consent');
    expect(callArguments[1]).toEqual({ analytics: true });
  });

  it("initalises analytics if cookie consent is true but analytics hasn't yet been initialised", () => {
    Cookies.getJSON = jest
      .fn()
      .mockImplementationOnce(name =>
        name === 'cookie-consent' ? { analytics: true } : null
      );

    ReactGA.initialize = jest.fn();
    ReactGA.set = jest.fn();
    ReactGA.pageview = jest.fn();

    const testStore = mockStore(state);
    mount(
      <MuiThemeProvider theme={theme}>
        <Provider store={testStore}>
          <CookieConsent />
        </Provider>
      </MuiThemeProvider>
    );

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(initialiseAnalytics());

    expect(ReactGA.initialize).toHaveBeenCalled();
    expect(ReactGA.initialize).toHaveBeenCalledWith('test id', {
      titleCase: false,
      gaOptions: {
        cookieExpires: 60 * 60 * 24 * 365,
      },
    });

    expect(ReactGA.set).toHaveBeenCalled();
    expect(ReactGA.set).toHaveBeenCalledWith({
      anonymizeIp: true,
      page: '/',
    });

    expect(ReactGA.pageview).toHaveBeenCalled();
    expect(ReactGA.pageview).toHaveBeenCalledWith('/');
  });

  it('should set open to false if cookie-consent cookie is set', () => {
    Cookies.get = jest
      .fn()
      .mockImplementationOnce(name =>
        name === 'cookie-consent' ? { analytics: true } : null
      );

    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <CookieConsent store={mockStore(state)} />
      </MuiThemeProvider>
    );

    expect(wrapper.prop('open')).toBeFalsy();
  });

  it('should set open to false if site is loading', () => {
    state.scigateway.siteLoading = false;

    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <CookieConsent store={mockStore(state)} />
      </MuiThemeProvider>
    );

    expect(wrapper.prop('open')).toBeFalsy();
  });

  it('should set open to false if on /cookies page', () => {
    state.router.location = createLocation('/cookies');

    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <CookieConsent store={mockStore(state)} />
      </MuiThemeProvider>
    );

    expect(wrapper.prop('open')).toBeFalsy();
  });
});
