import React from 'react';
import CookiesPage from './cookiesPage.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { initialState } from '../state/reducers/scigateway.reducer';
import { buildTheme } from '../theming';
import { MuiThemeProvider } from '@material-ui/core';
import Cookies from 'js-cookie';
import { createLocation } from 'history';
import { push } from 'connected-react-router';

describe('Cookies page component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({});
    mount = createMount();

    mockStore = configureStore();
    state = JSON.parse(
      JSON.stringify({
        scigateway: initialState,
        router: { location: createLocation('/cookies') },
      })
    );

    Cookies.set = jest.fn();
    Cookies.remove = jest.fn();
  });

  afterEach(() => {
    mount.cleanUp();
  });

  const theme = buildTheme();

  it('should render correctly', () => {
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <CookiesPage store={mockStore(state)} />
      </MuiThemeProvider>
    );
    expect(
      wrapper
        .dive()
        .dive()
        .dive()
    ).toMatchSnapshot();
  });

  it('should save preferences when save preferences button clicked', () => {
    const testStore = mockStore(state);

    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <CookiesPage store={testStore} />
      </MuiThemeProvider>
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
      .mockImplementationOnce(name =>
        name === 'cookie-consent' ? { analytics: true } : null
      );

    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <CookiesPage store={testStore} />
      </MuiThemeProvider>
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
