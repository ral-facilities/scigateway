import React from 'react';
import PageNotFound from './pageNotFound.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { initialState } from '../state/reducers/daaas.reducer';

describe('Page Not found component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({});
    mount = createMount();

    mockStore = configureStore();
    state = {
      daaas: initialState,
    };
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('app bar renders correctly', () => {
    const wrapper = shallow(<PageNotFound store={mockStore(state)} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
