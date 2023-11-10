import React from 'react';
import { createLocation } from 'history';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { StateType } from '../state/state.types';
import configureStore, { MockStore } from 'redux-mock-store';

import { Provider } from 'react-redux';
import { buildTheme } from '../theming';
import TestAuthProvider from '../authentication/testAuthProvider';
import thunk from 'redux-thunk';
import {
  loadMaintenanceState,
  loadScheduledMaintenanceState,
} from '../state/actions/scigateway.actions';
import { MemoryRouter } from 'react-router';
import MaintenancePage from './maintenancePage.component';
import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('maintenance page component', () => {
  let mockStore;
  let store: MockStore;
  let state: StateType;

  beforeEach(() => {
    mockStore = configureStore([thunk]);
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/admin') },
    };
    state.scigateway.authorisation.provider = new TestAuthProvider(null);

    store = mockStore(state);
  });

  const theme = buildTheme(false);

  function Wrapper({
    children,
  }: {
    children: React.ReactElement;
  }): JSX.Element {
    return (
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
              {children}
            </MemoryRouter>
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );
  }

  it('setScheduledMaintenanceState action should be sent when the setScheduledMaintenanceState function is called', async () => {
    const user = userEvent.setup();

    render(<MaintenancePage />, { wrapper: Wrapper });

    await user.type(
      screen.getByRole('textbox', {
        name: 'admin.scheduled-maintenance-message-arialabel',
      }),
      'test'
    );
    await user.click(
      screen.getByRole('checkbox', {
        name: 'admin.scheduled-maintenance-checkbox-arialabel',
      })
    );
    await user.click(
      screen.getByRole('button', { name: 'admin.severity-select-arialabel' })
    );
    await user.click(screen.getByRole('option', { name: 'Information' }));
    await user.click(
      screen.getAllByRole('button', { name: 'admin.save-button' })[0]
    );

    await waitFor(() => {
      expect(store.getActions().length).toEqual(1);
      expect(store.getActions()[0]).toEqual(
        loadScheduledMaintenanceState({
          show: true,
          message: 'test',
          severity: 'information',
        })
      );
    });
  });

  it('setMaintenanceState action should be sent when the setMaintenanceState function is called', async () => {
    const user = userEvent.setup();

    render(<MaintenancePage />, { wrapper: Wrapper });

    await user.type(
      screen.getByRole('textbox', {
        name: 'admin.maintenance-message-arialabel',
      }),
      'test'
    );
    await user.click(
      screen.getByRole('checkbox', {
        name: 'admin.maintenance-checkbox-arialabel',
      })
    );
    await user.click(
      screen.getAllByRole('button', { name: 'admin.save-button' })[1]
    );

    expect(store.getActions().length).toEqual(1);
    expect(store.getActions()[0]).toEqual(
      loadMaintenanceState({ show: true, message: 'test' })
    );
  });
});
