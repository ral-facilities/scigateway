import React from 'react';
import CookiesPage, {
  UnconnectedCookiesPage,
  CombinedCookiesPageProps,
} from './cookiesPage.component';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { buildTheme } from '../theming';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import Cookies from 'js-cookie';
import { createLocation } from 'history';
import { push } from 'connected-react-router';
import { shallow, mount } from 'enzyme';

describe('Cookies page component', () => {
  let mockStore;
  let state: StateType;
  let props: CombinedCookiesPageProps;

  beforeEach(() => {
    mockStore = configureStore();
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/cookies') },
    };

    props = {
      res: undefined,
      navigateToHome: jest.fn(),
    };

    Cookies.set = jest.fn();
    Cookies.remove = jest.fn();
  });

  const theme = buildTheme(false);

  it('should render correctly', () => {
    const wrapper = shallow(<UnconnectedCookiesPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should save preferences when save preferences button clicked', () => {
    const testStore = mockStore(state);

    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CookiesPage store={testStore} />
        </ThemeProvider>
      </StyledEngineProvider>
    );

    wrapper
      .find('input[aria-labelledby="analytics-cookies-title"]')
      .simulate('change', { target: { checked: true } });

    wrapper.find('button').simulate('click');

    expect(Cookies.set).toHaveBeenCalled();
    const mockCookies = (Cookies.set as jest.Mock).mock;
    const callArguments = mockCookies.calls[0];
    expect(callArguments[0]).toEqual('cookie-consent');
    expect(callArguments[1]).toEqual({ analytics: true });

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/'));
  });

  it('should remove cookies when user revokes consent', () => {
    const testStore = mockStore(state);

    Cookies.getJSON = jest
      .fn()
      .mockImplementationOnce((name) =>
        name === 'cookie-consent' ? { analytics: true } : null
      );

    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CookiesPage store={testStore} />
        </ThemeProvider>
      </StyledEngineProvider>
    );

    expect(
      wrapper
        .find('input[aria-labelledby="analytics-cookies-title"]')
        .prop('checked')
    ).toBeTruthy();

    wrapper
      .find('input[aria-labelledby="analytics-cookies-title"]')
      .simulate('change', { target: { checked: false } });
    wrapper.find('button').simulate('click');

    expect(Cookies.set).toHaveBeenCalled();
    const mockCookiesSet = (Cookies.set as jest.Mock).mock;
    const setCallArguments = mockCookiesSet.calls[0];
    expect(setCallArguments[0]).toEqual('cookie-consent');
    expect(setCallArguments[1]).toEqual({ analytics: false });

    expect(Cookies.remove).toHaveBeenCalledTimes(2);
    const mockCookiesRemove = (Cookies.remove as jest.Mock).mock;
    expect(mockCookiesRemove.calls[0][0]).toEqual('_ga');
    expect(mockCookiesRemove.calls[1][0]).toEqual('_gid');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/'));
  });
});
