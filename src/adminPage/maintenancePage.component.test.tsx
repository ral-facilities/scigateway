import React from 'react';
import { mount } from 'enzyme';
import { createLocation } from 'history';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';

import { Provider } from 'react-redux';
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
import MaintenancePage from './maintenancePage.component';
import { StyledEngineProvider, ThemeProvider } from '@mui/material';

describe('maintenance page component', () => {
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    mockStore = configureStore([thunk]);

    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/admin') },
    };
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
  });

  const theme = buildTheme(false);

  it('setScheduledMaintenanceState action should be sent when the setScheduledMaintenanceState function is called', async () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
              <MaintenancePage />
            </MemoryRouter>
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    const scheduledMaintenanceMessageInput = wrapper.find(
      'textarea[aria-label="admin.scheduled-maintenance-message-arialabel"]'
    );

    scheduledMaintenanceMessageInput.instance().value = 'test';
    scheduledMaintenanceMessageInput.simulate('change');

    wrapper
      .find('[aria-label="admin.scheduled-maintenance-checkbox-arialabel"]')
      .last()
      .simulate('change', { target: { checked: true } });
    wrapper.find('button').first().simulate('click');

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
              <MaintenancePage />
            </MemoryRouter>
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    const maintenanceMessageInput = wrapper.find(
      'textarea[aria-label="admin.maintenance-message-arialabel"]'
    );
    maintenanceMessageInput.instance().value = 'test';
    maintenanceMessageInput.simulate('change');
    wrapper
      .find('[aria-label="admin.maintenance-checkbox-arialabel"]')
      .last()
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
});
