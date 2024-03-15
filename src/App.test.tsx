import { useMediaQuery } from '@mui/material';
import { act, fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';
import { createRoot } from 'react-dom/client';
import App, { AppSansHoc } from './App';
import { flushPromises } from './setupTests';
import { RegisterRouteType } from './state/scigateway.types';

vi.mock('./state/actions/loadMicroFrontends', () => ({
  init: vi.fn(() => Promise.resolve()),
  singleSpaPluginRoutes: ['/plugin1'],
}));
vi.mock('@mui/material', async () => ({
  __esmodule: true,
  ...(await vi.importActual('@mui/material')),
  useMediaQuery: vi.fn(),
}));

// Needed for the maintenance state update test, has to be hoisted in order to be run before any imports
vi.hoisted(() => {
  const testToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QifQ.hNQI_r8BATy1LyXPr6Zuo9X_V0kSED8ngcqQ6G-WV5w';
  vi.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(
    (name) => (name === 'scigateway:token' ? testToken : null)
  );
});

/* Have to remock to replace the auth-provider just for this file. We used to be able to use
   expect.getState().testPath?.includes('App.test') inside the __mocks__ folder, but this is undefined
   until the tests in this file are actually executed since migrating from Jest to Vitest */
vi.mock('axios', async () => {
  return {
    default: {
      get: vi.fn((path) => {
        if (path === '/settings.json') {
          return Promise.resolve({
            data: {
              'auth-provider': 'icat',
              'ui-strings': '/res/default.json',
              plugins: [],
              'help-tour-steps': [],
            },
          });
        } else {
          return Promise.resolve({
            data: {},
          });
        }
      }),
      post: vi.fn(() => Promise.resolve({ data: {} })),
    },
  };
});

describe('App', () => {
  beforeEach(() => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      root.render(<App useSuspense={false} />);
    });
    act(() => {
      root.unmount();
    });
  });

  it('should show preloader when react-i18next is not ready', () => {
    render(<AppSansHoc t={vi.fn()} i18n={{}} tReady={false} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should dispatch loadMaintenanceState and force refresh the page when maintenance changes', async () => {
    // mock so token verify succeeds
    vi.mocked(axios.post).mockImplementation(() =>
      Promise.resolve({
        data: {},
      })
    );
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: vi.fn() },
    });

    vi.useFakeTimers();

    render(<AppSansHoc t={vi.fn()} i18n={{}} tReady={true} />);

    const registerRouteAction = {
      type: RegisterRouteType,
      payload: {
        section: 'test',
        link: '/plugin1',
        plugin: 'test_plugin',
        displayName: 'Test plugin',
        order: 0,
      },
    };

    act(() => {
      document.dispatchEvent(
        new CustomEvent('scigateway', {
          detail: registerRouteAction,
        })
      );
    });

    // go to plugin page
    fireEvent.click(screen.getByRole('link', { name: 'Test plugin' }));

    // eslint-disable-next-line testing-library/no-node-access
    expect(document.getElementById('test_plugin')).toBeInTheDocument();

    expect(screen.queryByText('Maintenance')).not.toBeInTheDocument();

    vi.mocked(axios.get).mockImplementation(() =>
      Promise.resolve({
        data: {
          show: true,
          message: 'test message',
        },
      })
    );

    act(() => {
      vi.runOnlyPendingTimers();
    });

    await act(async () => {
      await flushPromises();
    });

    expect(screen.getByText('Maintenance')).toBeInTheDocument();
    expect(screen.getByText('test message')).toBeInTheDocument();

    // should not refresh page when maintenance state changes from false to true
    expect(window.location.reload).not.toHaveBeenCalled();

    vi.mocked(axios.get).mockImplementation(() =>
      Promise.resolve({
        data: {
          show: false,
          message: 'test message',
        },
      })
    );

    vi.runOnlyPendingTimers();

    await act(async () => {
      await flushPromises();
    });

    // should refresh page when maintenance state changes from true to false
    expect(window.location.reload).toHaveBeenCalled();
  });
});
