import React from 'react';
import MainAppBarComponent, { MenuButton } from './mainAppBar.component';
import { createShallow } from '@material-ui/core/test-utils';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { initialState } from '../state/reducers/daaas.reducer';

describe('Main app bar component', () => {
  let shallow;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({});

    mockStore = configureStore();
    state = {
      daaas: initialState,
    };
  });

  it('app bar renders correctly', () => {
    const wrapper = shallow(<MainAppBarComponent store={mockStore(state)} />);
    expect(wrapper.dive().dive()).toMatchSnapshot();
  });

  it('MenuButton renders correctly', () => {
    const wrapper = shallow(
      <MenuButton buttonText="test" buttonClassName="test-class-1" />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
