import React from 'react';
import { createMount } from '@mui/material/test-utils';
import configureStore from 'redux-mock-store';
import { default as MaintenancePage } from './maintenancePage.component';
import { Provider } from 'react-redux';
import { StateType } from '../state/state.types';
import { authState, initialState } from '../state/reducers/scigateway.reducer';

describe('Maintenance page component', () => {
  let mount;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    mount = createMount();

    mockStore = configureStore();
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
    };
    state.scigateway.maintenance.message = 'test';
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('should render correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MaintenancePage />
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
