import React from 'react';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import HomePage from './homePage.component';
import { MuiThemeProvider } from '@material-ui/core';
import { buildTheme } from '../theming';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { initialState } from '../state/reducers/scigateway.reducer';

describe('Home page component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({});
    mount = createMount();

    mockStore = configureStore();
    state = JSON.parse(JSON.stringify({ scigateway: initialState }));
  });

  afterEach(() => {
    mount.cleanUp();
  });

  const theme = buildTheme();

  it('homepage renders correctly', () => {
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <HomePage store={mockStore(state)} />
      </MuiThemeProvider>
    );
    expect(
      wrapper
        .dive()
        .dive()
        .dive()
    ).toMatchSnapshot();
  });
});
