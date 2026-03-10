import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore, { MockStore } from 'redux-mock-store';
import TestAuthProvider from '../authentication/testAuthProvider';
import { toggleDrawer, toggleHelp } from '../state/actions/scigateway.actions';
import { initialState } from '../state/reducers/scigateway.reducer';
import { StateType } from '../state/state.types';
import { buildTheme } from '../theming';
import Tour from './tour.component';

vi.mock('popper.js', async () => {
  const PopperJS = await vi.importActual('popper.js');

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

  function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
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
    vi.useFakeTimers({ shouldAdvanceTime: true });
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

    expect(await screen.findByText('Plugin link test')).toBeInTheDocument();

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
