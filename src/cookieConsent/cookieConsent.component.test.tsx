import React from 'react';

import CookieConsent from './cookieConsent.component';
import { StateType } from '../state/state.types';
import configureStore, { MockStore } from 'redux-mock-store';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { initialiseAnalytics } from '../state/actions/scigateway.actions';
import { Provider } from 'react-redux';
import { buildTheme } from '../theming';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import Cookies from 'js-cookie';
import { createLocation } from 'history';
import { push } from 'connected-react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Cookie consent component', () => {
  let mockStore;
  let state: StateType;
  let store: MockStore;

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

    store = mockStore(state);
  });

  const theme = buildTheme(false);

  function Wrapper({
    children,
  }: {
    children: React.ReactElement;
  }): JSX.Element {
    return (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={store}>{children}</Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  }

  it('should render correctly', () => {
    render(<CookieConsent />, { wrapper: Wrapper });

    expect(
      screen.getByRole('button', { name: 'manage-preferences-button' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'accept-button' })
    ).toBeInTheDocument();
    expect(screen.getByText('text')).toBeInTheDocument();
  });

  it('should navigate to cookie page on user clicking manage preferences', async () => {
    const user = userEvent.setup();

    render(<CookieConsent />, { wrapper: Wrapper });

    await user.click(
      screen.getByRole('button', { name: 'manage-preferences-button' })
    );

    expect(store.getActions().length).toEqual(1);
    expect(store.getActions()[0]).toEqual(push('/cookies'));
  });

  it('should set cookie to true upon user accept', async () => {
    Cookies.set = jest.fn();
    const user = userEvent.setup();

    render(<CookieConsent />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'accept-button' }));

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

    render(<CookieConsent />, { wrapper: Wrapper });

    expect(store.getActions().length).toEqual(1);
    expect(store.getActions()[0]).toEqual(initialiseAnalytics());

    const expectedUrlScript = document.createElement('script');
    expectedUrlScript.async = true;
    expectedUrlScript.src = `https://www.googletagmanager.com/gtag/js?id=${state.scigateway.analytics?.id}`;

    const expectedGtagScript = document.createElement('script');
    expectedGtagScript.innerText =
      'window.dataLayer = window.dataLayer || [];' +
      'function gtag(){dataLayer.push(arguments);}' +
      "gtag('js', new Date());" +
      `gtag('config', '${state.scigateway.analytics?.id}');`;

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
      .mockImplementation((name) =>
        name === 'cookie-consent' ? JSON.stringify({ analytics: true }) : null
      );

    render(<CookieConsent />, { wrapper: Wrapper });

    expect(screen.queryByText('text')).toBeNull();
  });

  it('should set open to false if site is loading', () => {
    state.scigateway.siteLoading = true;
    store = mockStore(state);

    render(<CookieConsent />, { wrapper: Wrapper });

    expect(screen.queryByText('text')).toBeNull();
  });

  it('should set open to false if on /cookies page', () => {
    state.router = { location: createLocation('/cookies') };
    store = mockStore(state);

    render(<CookieConsent />, { wrapper: Wrapper });

    expect(screen.queryByText('text')).toBeNull();
  });
});
