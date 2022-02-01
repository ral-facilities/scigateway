import React from 'react';

import CookieConsent, {
  CookieConsentWithoutStyles,
  CombinedCookieConsentProps,
} from './cookieConsent.component';
import { createShallow, createMount } from '@mui/material/test-utils';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { initialiseAnalytics } from '../state/actions/scigateway.actions';
import { Provider } from 'react-redux';
import { buildTheme } from '../theming';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import Cookies from 'js-cookie';
import ReactGA from 'react-ga';
import { createLocation } from 'history';
import { push } from 'connected-react-router';

describe('Cookie consent component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  let props: CombinedCookieConsentProps;

  beforeEach(() => {
    shallow = createShallow({});
    mount = createMount();

    mockStore = configureStore();
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/') },
    };
    state.scigateway.siteLoading = false;
    state.scigateway.analytics = {
      id: 'test id',
      initialised: false,
    };

    props = {
      analytics: state.scigateway.analytics,
      res: undefined,
      location: state.router.location,
      loading: state.scigateway.siteLoading,
      initialiseAnalytics: jest.fn(),
      navigateToCookies: jest.fn(),
      classes: {
        root: 'root-class',
        button: 'button-class',
      },
    };
  });

  afterEach(() => {
    mount.cleanUp();
  });

  const theme = buildTheme(false);

  it('should render correctly', () => {
    const wrapper = shallow(<CookieConsentWithoutStyles {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should navigate to cookie page on user clicking manage preferences', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={testStore}>
            <CookieConsent />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );

    wrapper.find('button').first().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/cookies'));
  });

  it('should set cookie to true upon user accept', () => {
    Cookies.set = jest.fn();
    const testStore = mockStore(state);
    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={testStore}>
            <CookieConsent />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );

    wrapper.find('button').last().simulate('click');

    expect(Cookies.set).toHaveBeenCalled();
    const mockCookies = (Cookies.set as jest.Mock).mock;
    const callArguments = mockCookies.calls[0];
    expect(callArguments[0]).toEqual('cookie-consent');
    expect(callArguments[1]).toEqual({ analytics: true });
  });

  it("initalises analytics if cookie consent is true but analytics hasn't yet been initialised", () => {
    Cookies.getJSON = jest
      .fn()
      .mockImplementationOnce((name) =>
        name === 'cookie-consent' ? { analytics: true } : null
      );

    ReactGA.initialize = jest.fn();
    ReactGA.set = jest.fn();
    ReactGA.pageview = jest.fn();

    const testStore = mockStore(state);
    mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={testStore}>
            <CookieConsent />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
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
      .mockImplementationOnce((name) =>
        name === 'cookie-consent' ? { analytics: true } : null
      );

    const wrapper = shallow(<CookieConsentWithoutStyles {...props} />);

    expect(wrapper.prop('open')).toBeFalsy();
  });

  it('should set open to false if site is loading', () => {
    props.loading = false;

    const wrapper = shallow(<CookieConsentWithoutStyles {...props} />);

    expect(wrapper.prop('open')).toBeFalsy();
  });

  it('should set open to false if on /cookies page', () => {
    props.location = createLocation('/cookies');

    const wrapper = shallow(<CookieConsentWithoutStyles {...props} />);

    expect(wrapper.prop('open')).toBeFalsy();
  });
});
