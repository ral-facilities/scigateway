import React from 'react';
import Tour from './tour.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { initialState } from '../state/reducers/daaas.reducer';
import { createLocation } from 'history';
import { toggleHelp } from '../state/actions/daaas.actions';
import { Provider } from 'react-redux';
import Joyride from 'react-joyride';
import { buildTheme } from '../theming';
import { MuiThemeProvider } from '@material-ui/core';

jest.mock('popper.js', () => {
  const PopperJS = jest.requireActual('popper.js');

  return class {
    public static placements = PopperJS.placements;

    public constructor() {
      return {
        destroy: () => {},
        scheduleUpdate: () => {},
      };
    }
  };
});

describe('Tour component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  const theme = buildTheme();

  beforeEach(() => {
    shallow = createShallow({});
    mount = createMount();

    state = {
      daaas: {
        ...initialState,
        helpSteps: [
          {
            target: '.test-1',
            content: 'Test 1',
          },
          {
            target: '.test-2',
            content: 'Test 2',
          },
        ],
      },
      router: {
        action: 'POP',
        location: createLocation('/'),
      },
    };
    mockStore = configureStore();
  });

  it('renders correctly', () => {
    state.daaas.showHelp = true;

    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <Tour store={mockStore(state)} />
      </MuiThemeProvider>
    );
    expect(
      wrapper
        .dive()
        .dive()
        .dive()
    ).toMatchSnapshot();
  });

  it('shows next tooltip when next is clicked', () => {
    state.daaas.showHelp = true;
    const testStore = mockStore(state);

    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <Provider store={testStore}>
          <div>
            <Tour />
            <div className="test-1" />
            <div className="test-2" />
          </div>
        </Provider>
      </MuiThemeProvider>
    );

    let joyride: Joyride = wrapper.find('Joyride').instance();
    expect(joyride.state.index).toEqual(0);

    wrapper
      .find('JoyrideTooltip')
      .find('button[aria-label="Next"]')
      .first()
      .simulate('click');

    expect(joyride.state.index).toEqual(1);
  });

  it('shows previous tooltip when back is clicked', () => {
    state.daaas.showHelp = true;
    const testStore = mockStore(state);

    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <Provider store={testStore}>
          <div>
            <Tour />
            <div className="test-1" />
            <div className="test-2" />
          </div>
        </Provider>
      </MuiThemeProvider>
    );

    let joyride: Joyride = wrapper.find('Joyride').instance();
    joyride.setState({ index: 1 });
    wrapper.update();
    expect(joyride.state.index).toEqual(1);

    wrapper
      .find('JoyrideTooltip')
      .find('button[aria-label="Back"]')
      .first()
      .simulate('click');

    expect(joyride.state.index).toEqual(0);
  });

  it('sends toggleHelp message when tour is finished', () => {
    state.daaas.showHelp = true;
    const testStore = mockStore(state);

    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <Provider store={testStore}>
          <div>
            <Tour />
            <div className="test-1" />
          </div>
        </Provider>
      </MuiThemeProvider>
    );

    wrapper
      .find('JoyrideTooltip')
      .find('button[aria-label="Close"]')
      .first()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleHelp());
  });
});
