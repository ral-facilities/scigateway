import React from 'react';
import { act } from 'react-dom/test-utils';
import Tour from './tour.component';
import configureStore, { MockStore } from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';
import { toggleDrawer, toggleHelp } from '../state/actions/scigateway.actions';
import { Provider } from 'react-redux';
import { buildTheme } from '../theming';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import TestAuthProvider from '../authentication/testAuthProvider';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('popper.js', async () => {
  const PopperJS = await vi.requireActual('popper.js');

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

  let testStore: MockStore;
  let state: StateType;
  let holder;

  function Wrapper({
    children,
  }: {
    children: React.ReactElement;
  }): JSX.Element {
    return (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={testStore}>{children}</Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  }

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
    testStore = configureStore()(state);

    holder = document.createElement('div');
    document.body.appendChild(holder);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('can navigate between tutorial steps', async () => {
    state.scigateway.showHelp = true;
    const user = userEvent.setup();

    render(
      <div>
        <Tour />
        <div className="test-1" />
        <div className="test-2" />
      </div>,
      { wrapper: Wrapper }
    );

    // first step should be test-1
    expect(screen.getByText('Test 1')).toBeInTheDocument();

    // i have no idea why testing library can't find the button with getByRole
    // even though the next button is CLEARLY a button with a button role EXPLICITLY specified
    // time wasted: too much
    await user.click(screen.getByLabelText('Next'));
    expect(await screen.findByText('Test 2')).toBeInTheDocument();
  });

  it('sends toggleHelp message when tour is finished', async () => {
    state.scigateway.showHelp = true;
    const user = userEvent.setup();

    render(
      <div>
        <Tour />
        <div className="test-1" />
        <div className="test-2" />
      </div>,
      { wrapper: Wrapper }
    );

    await user.click(screen.getByLabelText('Close'));

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleHelp());
  });

  it('sends toggleDrawer message when tour moves into plugin link tour steps', async () => {
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
    vi.useFakeTimers();
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    render(
      <div>
        <Tour />
        <div className="test-1" />
        <div id="plugin-link-test" />
      </div>,
      { wrapper: Wrapper }
    );

    await user.click(screen.getByLabelText('Next'));

    act(() => {
      vi.runAllTimers();
    });

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(toggleDrawer());
  });

  it('does not show plugin links when user is not logged in', async () => {
    state.scigateway.showHelp = true;
    state.scigateway.authorisation.provider = new TestAuthProvider(null);
    const user = userEvent.setup();

    render(
      <div>
        <Tour />
        <div className="test-1" />
        <div className="test-2" />
        <div id="plugin-link-test" />
      </div>,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Test 1')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Next'));
    expect(await screen.findByText('Test 2')).toBeInTheDocument();
    // Test 2 should be the last step, so no next button
    expect(screen.queryByLabelText('Next')).toBeNull();
  }, 10000);
});
