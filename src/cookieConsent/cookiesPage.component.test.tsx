import React from 'react';
import CookiesPage from './cookiesPage.component';
import { StateType } from '../state/state.types';
import configureStore, { MockStore } from 'redux-mock-store';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { buildTheme } from '../theming';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import Cookies from 'js-cookie';
import { createLocation } from 'history';
import { push } from 'connected-react-router';
import { TOptionsBase } from 'i18next';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: (key: string, options: TOptionsBase) =>
        options?.returnObjects ? [1, 2, 3].map((x) => `${key} ${x}`) : key,
    };
  },
}));

describe('Cookies page component', () => {
  let mockStore;
  let state: StateType;
  let store: MockStore;

  beforeEach(() => {
    mockStore = configureStore();
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/cookies') },
    };
    store = mockStore(state);

    Cookies.set = jest.fn();
    Cookies.remove = jest.fn();
  });

  const theme = buildTheme(false);

  function Wrapper({
    children,
  }: {
    children: React.ReactElement;
  }): JSX.Element {
    return (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </StyledEngineProvider>
    );
  }

  it('should render correctly', () => {
    const { asFragment } = render(<CookiesPage store={store} />, {
      wrapper: Wrapper,
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it('should save preferences when save preferences button clicked', async () => {
    const user = userEvent.setup();

    render(<CookiesPage store={store} />, {
      wrapper: Wrapper,
    });

    await user.click(
      screen.getByRole('checkbox', { name: 'analytics-cookies-title' })
    );
    await user.click(
      screen.getByRole('button', { name: 'save-preferences-button' })
    );

    expect(Cookies.set).toHaveBeenCalled();
    const mockCookies = (Cookies.set as jest.Mock).mock;
    const callArguments = mockCookies.calls[0];
    expect(callArguments[0]).toEqual('cookie-consent');
    expect(callArguments[1]).toEqual(JSON.stringify({ analytics: true }));

    expect(store.getActions().length).toEqual(1);
    expect(store.getActions()[0]).toEqual(push('/'));
  });

  it('should remove cookies when user revokes consent', async () => {
    const user = userEvent.setup();
    Cookies.get = jest
      .fn()
      .mockImplementationOnce((name) =>
        name === 'cookie-consent' ? JSON.stringify({ analytics: true }) : null
      );

    render(<CookiesPage store={store} />, {
      wrapper: Wrapper,
    });

    const analyticsSwitch = screen.getByRole('checkbox', {
      name: 'analytics-cookies-title',
    });
    expect(analyticsSwitch).toBeChecked();

    await user.click(analyticsSwitch);
    await user.click(
      screen.getByRole('button', { name: 'save-preferences-button' })
    );

    expect(Cookies.set).toHaveBeenCalled();
    const mockCookiesSet = (Cookies.set as jest.Mock).mock;
    const setCallArguments = mockCookiesSet.calls[0];
    expect(setCallArguments[0]).toEqual('cookie-consent');
    expect(setCallArguments[1]).toEqual(JSON.stringify({ analytics: false }));

    expect(Cookies.remove).toHaveBeenCalledTimes(2);
    const mockCookiesRemove = (Cookies.remove as jest.Mock).mock;
    expect(mockCookiesRemove.calls[0][0]).toEqual('_ga');
    expect(mockCookiesRemove.calls[1][0]).toEqual('_gid');

    expect(store.getActions().length).toEqual(1);
    expect(store.getActions()[0]).toEqual(push('/'));
  });
});
