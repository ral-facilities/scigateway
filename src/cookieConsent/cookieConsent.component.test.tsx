import React from 'react';

import CookieConsent, {
  UnconnectedCookieConsent,
  CombinedCookieConsentProps,
} from './cookieConsent.component';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { initialiseAnalytics } from '../state/actions/scigateway.actions';
import { Provider } from 'react-redux';
import { buildTheme } from '../theming';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import Cookies from 'js-cookie';
import { createLocation } from 'history';
import { push } from 'connected-react-router';
import { shallow, mount } from 'enzyme';

describe('Cookie consent component', () => {
  let mockStore;
  let state: StateType;
  let props: CombinedCookieConsentProps;

  beforeEach(() => {
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
    };
  });

  const theme = buildTheme(false);

  it('should render correctly', () => {
    const wrapper = shallow(<UnconnectedCookieConsent {...props} />);
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
    expect(callArguments[1]).toEqual(JSON.stringify({ analytics: true }));
  });

  it("initalises analytics if cookie consent is true but analytics hasn't yet been initialised", () => {
    jest.spyOn(document.head, 'appendChild');

    Cookies.get = jest
      .fn()
      .mockImplementationOnce((name) =>
        name === 'cookie-consent' ? JSON.stringify({ analytics: true }) : 'null'
      );

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

    const expectedUrlScript = document.createElement('script');
    expectedUrlScript.async = true;
    expectedUrlScript.src =
      'https://www.googletagmanager.com/gtag/js?id=G-BMV4M8LC8J';

    const expectedGtagScript = document.createElement('script');
    expectedGtagScript.innerText =
      'window.dataLayer = window.dataLayer || [];' +
      'function gtag(){dataLayer.push(arguments);}' +
      "gtag('js', new Date());" +
      "gtag('config', 'G-BMV4M8LC8J');";

    expect(document.head.appendChild).toHaveBeenNthCalledWith(
      1,
      expectedUrlScript
    );
    expect(document.head.appendChild).toHaveBeenNthCalledWith(
      2,
      expectedGtagScript
    );
  });

  it('should set open to false if cookie-consent cookie is set', () => {
    Cookies.get = jest
      .fn()
      .mockImplementationOnce((name) =>
        name === 'cookie-consent' ? JSON.stringify({ analytics: true }) : null
      );

    const wrapper = shallow(<UnconnectedCookieConsent {...props} />);

    expect(wrapper.prop('open')).toBeFalsy();
  });

  it('should set open to false if site is loading', () => {
    props.loading = false;

    const wrapper = shallow(<UnconnectedCookieConsent {...props} />);

    expect(wrapper.prop('open')).toBeFalsy();
  });

  it('should set open to false if on /cookies page', () => {
    props.location = createLocation('/cookies');

    const wrapper = shallow(<UnconnectedCookieConsent {...props} />);

    expect(wrapper.prop('open')).toBeFalsy();
  });
});
