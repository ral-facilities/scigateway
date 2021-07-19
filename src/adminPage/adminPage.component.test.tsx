import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { createLocation } from 'history';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import AdminPage from './adminPage.component';
import { Provider } from 'react-redux';
import { MuiThemeProvider } from '@material-ui/core';
import { buildTheme } from '../theming';
import TestAuthProvider from '../authentication/testAuthProvider';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { flushPromises } from '../setupTests';
import {
  loadMaintenanceState,
  loadScheduledMaintenanceState,
} from '../state/actions/scigateway.actions';
import { MemoryRouter } from 'react-router';

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
        <MuiThemeProvider theme={theme}>
          <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
            <AdminPage />
          </MemoryRouter>
        </MuiThemeProvider>
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
        <MuiThemeProvider theme={theme}>
          <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
            <AdminPage />
          </MemoryRouter>
        </MuiThemeProvider>
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

  it.skip('redirects to Admin Download table when Admin Download tab is clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MuiThemeProvider theme={theme}>
          <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
            <AdminPage />
          </MemoryRouter>
        </MuiThemeProvider>
      </Provider>
    );

    wrapper.find('#download-tab').hostNodes().simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(push('/admin-download'));
  });
});
