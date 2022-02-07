import React from 'react';
import { ReactWrapper, shallow } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

// history package is part of react-router, which we depend on
// eslint-disable-next-line import/no-extraneous-dependencies
import { createLocation } from 'history';
import { MemoryRouter } from 'react-router-dom';

import PageContainer from './pageContainer.component';
import { StateType } from './state/state.types';
import { authState, initialState } from './state/reducers/scigateway.reducer';

describe('PageContainer - Tests', () => {
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
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/') },
    };
  });

  it('renders correctly', () => {
    const wrapper = createWrapper(state).find(PageContainer).dive();

    expect(wrapper).toMatchSnapshot();
  });
});
