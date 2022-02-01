import React from 'react';
import { createMount } from '@mui/material/test-utils';
import { createLocation, createMemoryHistory } from 'history';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import AdminPage from './adminPage.component';
import { Provider } from 'react-redux';
import { ThemeProvider, StyledEngineProvider } from '@mui/material';
import { buildTheme } from '../theming';
import TestAuthProvider from '../authentication/testAuthProvider';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { flushPromises } from '../setupTests';
import {
  loadMaintenanceState,
  loadScheduledMaintenanceState,
} from '../state/actions/scigateway.actions';
import { MemoryRouter, Router } from 'react-router-dom';

describe('Admin page component', () => {
  let mount;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    mount = createMount();
    mockStore = configureStore([thunk]);

    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/admin') },
    };
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
  });

  afterEach(() => {
    mount.cleanUp();
  });

  const theme = buildTheme(false);

  it('should render correctly', () => {
    const testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
          <AdminPage />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('setScheduledMaintenanceState action should be sent when the setScheduledMaintenanceState function is called', async () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
              <AdminPage />
            </MemoryRouter>
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    const scheduledMaintenanceMessageInput = wrapper.find(
      'textarea[aria-label="scheduled-maintenance-message-arialabel"]'
    );
    scheduledMaintenanceMessageInput.instance().value = 'test';
    scheduledMaintenanceMessageInput.simulate('change');
    wrapper
      .find('[aria-label="scheduled-maintenance-checkbox-arialabel"]')
      .simulate('change', { target: { checked: true } });
    wrapper.find('button').at(1).simulate('click');

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(
      loadScheduledMaintenanceState({ show: true, message: 'test' })
    );
  });

  it('setMaintenanceState action should be sent when the setMaintenanceState function is called', async () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
              <AdminPage />
            </MemoryRouter>
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    const maintenanceMessageInput = wrapper.find(
      'textarea[aria-label="maintenance-message-arialabel"]'
    );
    maintenanceMessageInput.instance().value = 'test';
    maintenanceMessageInput.simulate('change');
    wrapper
      .find('[aria-label="maintenance-checkbox-arialabel"]')
      .simulate('change', { target: { checked: true } });
    wrapper.find('button').last().simulate('click');

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(
      loadMaintenanceState({ show: true, message: 'test' })
    );
  });

  it('redirects to Admin Download table when Admin Download tab is clicked', () => {
    const testStore = mockStore(state);
    const history = createMemoryHistory();
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

    wrapper.find('#download-tab').first().simulate('click', { button: 0 });

    expect(history.location.pathname).toEqual('/admin-download');
  });
});
