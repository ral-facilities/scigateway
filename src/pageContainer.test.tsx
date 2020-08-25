import React from 'react';
import { ReactWrapper } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { createShallow } from '@material-ui/core/test-utils';
// history package is part of react-router, which we depend on
// eslint-disable-next-line import/no-extraneous-dependencies
import { createLocation } from 'history';
import { MemoryRouter } from 'react-router';

import PageContainer from './pageContainer.component';
import { StateType } from './state/state.types';
import { initialState } from './state/reducers/scigateway.reducer';

describe('PageContainer - Tests', () => {
  let shallow;
  let state: StateType;

  const createWrapper = (state: StateType): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    return shallow(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <PageContainer store={mockStore(state)} />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'Grid' });

    state = JSON.parse(
      JSON.stringify({
        scigateway: initialState,
        router: { location: createLocation('/') },
      })
    );
  });

  it('renders correctly', () => {
    const wrapper = createWrapper(state);

    expect(wrapper).toMatchSnapshot();
  });
});
