import React from 'react';
import { act } from 'react-dom/test-utils';
import Tour, { UnconnectedTour, CombinedTourProps } from './tour.component';
import { mount, shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';
import { toggleHelp, toggleDrawer } from '../state/actions/scigateway.actions';
import { Provider } from 'react-redux';
import Joyride from 'react-joyride';
import { buildTheme } from '../theming';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import TestAuthProvider from '../authentication/testAuthProvider';

jest.mock('popper.js', () => {
  const PopperJS = jest.requireActual('popper.js');

  return class {
    public static placements = PopperJS.placements;

    public constructor() {
      return {
        destroy: () => {
          // dummy
        },
        scheduleUpdate: () => {
          // dummy
        },
      };
    }
  };
});

describe('Tour component', () => {
  const theme = buildTheme(false);

  let mockStore;
  let state: StateType;
  let props: CombinedTourProps;
  let holder;

  beforeEach(() => {
    state = {
      scigateway: {
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
          {
            target: '#plugin-link-test',
            content: 'Plugin link test',
          },
        ],
      },
      router: {
        action: 'POP',
        location: createLocation('/'),
      },
    };
    mockStore = configureStore();

    props = {
      showHelp: state.scigateway.showHelp,
      helpSteps: state.scigateway.helpSteps,
      drawerOpen: state.scigateway.drawerOpen,
      loggedIn: state.scigateway.authorisation.provider.isLoggedIn(),

      dismissHelp: jest.fn(),
      toggleDrawer: jest.fn(),
    };

    holder = document.createElement('div');
    document.body.appendChild(holder);
  });

  it('renders correctly', () => {
    props.showHelp = true;

    const wrapper = shallow(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <UnconnectedTour {...props} />
        </ThemeProvider>
      </StyledEngineProvider>
    )
      .dive()
      .dive();
    expect(wrapper.find(UnconnectedTour)).toMatchSnapshot();
  });

  it('renders correctly in dark mode', () => {
    const darkTheme = buildTheme(true);

    const wrapper = shallow(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={darkTheme}>
          <UnconnectedTour {...props} />
        </ThemeProvider>
      </StyledEngineProvider>
    )
      .dive()
      .dive();
    expect(wrapper.find(UnconnectedTour)).toMatchSnapshot();
  });

  it('shows next tooltip when next is clicked', () => {
    state.scigateway.showHelp = true;
    const testStore = mockStore(state);

    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={testStore}>
            <div>
              <Tour />
              <div className="test-1" />
              <div className="test-2" />
            </div>
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>,
      { attachTo: holder }
    );

    const joyride: Joyride = wrapper.find('Joyride').instance();
    expect(joyride.state.index).toEqual(0);

    wrapper
      .find('JoyrideTooltip')
      .find('button[aria-label="Next"]')
      .first()
      .simulate('click');

    expect(joyride.state.index).toEqual(1);
  });

  it('shows previous tooltip when back is clicked', () => {
    state.scigateway.showHelp = true;
    const testStore = mockStore(state);

    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={testStore}>
            <div>
              <Tour />
              <div className="test-1" />
              <div className="test-2" />
            </div>
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>,
      { attachTo: holder }
    );

    const joyride: Joyride = wrapper.find('Joyride').instance();
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
    state.scigateway.showHelp = true;
    const testStore = mockStore(state);

    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={testStore}>
            <div>
              <Tour />
              <div className="test-1" />
            </div>
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>,
      { attachTo: holder }
    );

    wrapper
      .find('JoyrideTooltip')
      .find('button[aria-label="Close"]')
      .first()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleHelp());
  });

  it('sends toggleDrawer message when tour moves into plugin link tour steps', () => {
    state.scigateway.drawerOpen = false;
    state.scigateway.showHelp = true;
    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );
    state.scigateway.helpSteps = [
      {
        target: '.test-1',
        content: 'Test 1',
      },
      {
        target: '#plugin-link-test',
        content: 'Plugin link test',
      },
    ];
    jest.useFakeTimers();

    const testStore = mockStore(state);

    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={testStore}>
            <div>
              <Tour />
              <div className="test-1" />
              <div id="plugin-link-test" />
            </div>
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>,
      { attachTo: holder }
    );

    const joyride: Joyride = wrapper.find('Joyride').instance();
    expect(joyride.state.index).toEqual(0);

    wrapper
      .find('JoyrideTooltip')
      .find('button[aria-label="Next"]')
      .first()
      .simulate('click');

    act(() => {
      jest.runAllTimers();
    });

    expect(joyride.state.index).toEqual(1);

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleDrawer());
  });

  it('sends toggleDrawer message when tour moves out of plugin link tour steps', () => {
    state.scigateway.drawerOpen = true;
    state.scigateway.showHelp = true;
    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );
    state.scigateway.helpSteps = [
      {
        target: '.test-1',
        content: 'Test 1',
      },
      {
        target: '#plugin-link-test',
        content: 'Plugin link test',
      },
    ];
    jest.useFakeTimers();

    const testStore = mockStore(state);

    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={testStore}>
            <div>
              <Tour />
              <div className="test-1" />
              <div id="plugin-link-test" />
            </div>
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>,
      { attachTo: holder }
    );

    const joyride: Joyride = wrapper.find('Joyride').instance();
    joyride.setState({ index: 1 });
    wrapper.update();
    expect(joyride.state.index).toEqual(1);

    wrapper
      .find('JoyrideTooltip')
      .find('button[aria-label="Back"]')
      .first()
      .simulate('click');

    act(() => {
      jest.runAllTimers();
    });

    expect(joyride.state.index).toEqual(0);

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleDrawer());
  });

  it('does not show plugin links when user is not logged in', () => {
    state.scigateway.showHelp = true;
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
    jest.useFakeTimers();

    const testStore = mockStore(state);

    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={testStore}>
            <div>
              <Tour />
              <div className="test-1" />
              <div className="test-2" />
              <div id="plugin-link-test" />
            </div>
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>,
      { attachTo: holder }
    );

    const steps = wrapper.find('Joyride').prop('steps');
    expect(steps.length).toEqual(2);
    expect(steps).not.toContainEqual({
      target: '#plugin-link-test',
      content: 'Plugin link test',
      disableBeacon: true,
    });
  });
});
