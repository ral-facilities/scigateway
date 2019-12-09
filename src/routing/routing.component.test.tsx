import React from 'react';
import Routing, { PluginPlaceHolder } from './routing.component';
import { createShallow } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';

describe('Routing component', () => {
  let shallow;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });

    state = {
      scigateway: initialState,
      router: {
        action: 'POP',
        location: createLocation('/'),
      },
    };

    mockStore = configureStore();
  });

  it('renders component with no plugin routes', () => {
    state.scigateway.plugins = [];
    const wrapper = shallow(<Routing store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders component with plugins', () => {
    state.scigateway.plugins = [
      {
        section: 'test section',
        link: 'test link',
        plugin: 'test_plugin_name',
        displayName: 'Test Plugin',
        order: 1,
      },
      {
        section: 'test section 2',
        link: 'test link 2',
        plugin: 'test_plugin_name_2',
        displayName: 'Test Plugin 2',
        order: 2,
      },
    ];
    const wrapper = shallow(<Routing store={mockStore(state)} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders placeholder for a plugin', () => {
    const wrapper = shallow(PluginPlaceHolder('test_id')());
    expect(wrapper).toMatchSnapshot();
  });
});
