import React from 'react';
import configureStore from 'redux-mock-store';
import { default as MaintenancePage } from './maintenancePage.component';
import { StateType } from '../state/state.types';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { render } from '@testing-library/react';

describe('Maintenance page component', () => {
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    mockStore = configureStore();
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
    };
    state.scigateway.maintenance.message = 'test';
  });

  it('should render correctly', () => {
    const testStore = mockStore(state);
    const { asFragment } = render(<MaintenancePage store={testStore} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
