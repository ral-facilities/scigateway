import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import { default as MaintenancePage } from './maintenancePage.component';
import { Provider } from 'react-redux';
import { StateType } from '../state/state.types';
import { initialState } from '../state/reducers/scigateway.reducer';

describe('Maintenance page component', () => {
  let mount;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    mount = createMount();

    mockStore = configureStore();
    state = JSON.parse(JSON.stringify({ scigateway: initialState }));
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
