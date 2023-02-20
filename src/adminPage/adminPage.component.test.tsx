import React from 'react';
import { mount } from 'enzyme';
import { createLocation, createMemoryHistory, History } from 'history';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import AdminPage from './adminPage.component';
import { Provider } from 'react-redux';
import { buildTheme } from '../theming';
import TestAuthProvider from '../authentication/testAuthProvider';
import thunk from 'redux-thunk';
import { MemoryRouter, Router } from 'react-router';
import { StyledEngineProvider, ThemeProvider } from '@mui/material';

describe('Admin page component', () => {
  let mockStore;
  let state: StateType;
  let history: History;

  beforeEach(() => {
    mockStore = configureStore([thunk]);
    history = createMemoryHistory();

    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/') },
    };
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
  });

  const theme = buildTheme(false);

  it('should render maintenance page correctly', () => {
    state.scigateway.adminPageDefaultTab = 'download';
    const testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <MemoryRouter
              initialEntries={[
                { key: 'testKey', pathname: '/admin/maintenance' },
              ]}
            >
              <AdminPage />
            </MemoryRouter>
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    expect(wrapper.find('#maintenance-page')).toBeTruthy();
  });

  it('should render admin plugins correctly', () => {
    state.scigateway.plugins = [
      {
        order: 1,
        plugin: 'datagateway-download',
        link: '/admin/download',
        section: 'Admin',
        displayName: 'Admin Download',
        admin: true,
      },
    ];

    state.scigateway.adminPageDefaultTab = 'maintenance';
    const testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <MemoryRouter
              initialEntries={[{ key: 'testKey', pathname: '/admin/download' }]}
            >
              <AdminPage />
            </MemoryRouter>
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );
    expect(wrapper.find('#datagateway-download')).toBeTruthy();
  });

  it('redirects to the tab when tab is clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <Router history={history}>
              <AdminPage />
            </Router>
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    wrapper.find('#download-tab').last().simulate('click', { button: 0 });

    expect(history.location.pathname).toEqual('/admin/download');

    wrapper.find('#maintenance-tab').last().simulate('click', { button: 0 });

    expect(history.location.pathname).toEqual('/admin/maintenance');
  });
});
