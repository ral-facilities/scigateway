import React from 'react';
import CookieConsent from './cookieConsent.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { initialState } from '../state/reducers/daaas.reducer';
import { initialiseAnalytics } from '../state/actions/daaas.actions';
import { Provider } from 'react-redux';
import { buildTheme } from '../theming';
import { MuiThemeProvider } from '@material-ui/core';
import Cookie from 'js-cookie';
import ReactGA from 'react-ga';

describe('Cookie consent component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({});
    mount = createMount();

    mockStore = configureStore();
    state = JSON.parse(JSON.stringify({ daaas: initialState }));
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
    expect(
      wrapper
        .dive()
        .dive()
        .dive()
    ).toMatchSnapshot();
  });

  it('should set cookie to false upon user decline', () => {
    Cookie.set = jest.fn();
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

    expect(Cookie.set).toHaveBeenCalled();
    const mockCookie = (Cookie.set as jest.Mock).mock;
    const callArguments = mockCookie.calls[0];
    expect(callArguments[0]).toEqual('cookie-consent');
    expect(callArguments[1]).toEqual('false');
  });

  it('should set cookie to true upon user accept', () => {
    Cookie.set = jest.fn();
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

    expect(Cookie.set).toHaveBeenCalled();
    const mockCookie = (Cookie.set as jest.Mock).mock;
    const callArguments = mockCookie.calls[0];
    expect(callArguments[0]).toEqual('cookie-consent');
    expect(callArguments[1]).toEqual('true');
  });

  it('should set open to false if cookie-consent cookie is set', () => {
    Cookie.get = jest
      .fn()
      .mockImplementation(name => (name === 'cookie-consent' ? 'true' : null));

    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <CookieConsent store={mockStore(state)} />
      </MuiThemeProvider>
    );

    expect(
      wrapper
        .dive()
        .dive()
        .dive()
        .prop('open')
    ).toBeFalsy();
  });

  it("initalises analytics if cookie consent is true but analytics hasn't yet been initialised", () => {
    state.daaas.analytics = {
      id: 'test id',
      initialised: false,
    };

    Cookie.get = jest
      .fn()
      .mockImplementation(name => (name === 'cookie-consent' ? 'true' : null));

    ReactGA.initialize = jest.fn();
    ReactGA.set = jest.fn();

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
    });

    expect(ReactGA.set).toHaveBeenCalled();
    expect(ReactGA.set).toHaveBeenCalledWith({
      anonymizeIp: true,
    });
  });
});
