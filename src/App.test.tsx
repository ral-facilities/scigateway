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

const testToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QifQ.hNQI_r8BATy1LyXPr6Zuo9X_V0kSED8ngcqQ6G-WV5w';

// needed for the maintenance state update test - for some reason it doesn't work when at the beginning of the test itself
window.localStorage.__proto__.getItem = vi.fn().mockImplementation((name) => {
  return name === 'scigateway:token' ? testToken : null;
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
    await fireEvent.click(screen.getByRole('link', { name: 'Test plugin' }));

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
