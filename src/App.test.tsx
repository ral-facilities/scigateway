import React from 'react';
import ReactDOM from 'react-dom';
import App, { AppSansHoc } from './App';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { flushPromises } from './setupTests';
import axios from 'axios';
import { RegisterRouteType } from './state/scigateway.types';

jest.mock('./state/actions/loadMicroFrontends', () => ({
  init: jest.fn(() => Promise.resolve()),
  singleSpaPluginRoutes: ['/plugin1'],
}));

const testToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QifQ.hNQI_r8BATy1LyXPr6Zuo9X_V0kSED8ngcqQ6G-WV5w';

// needed for the maintenance state update test - for some reason it doesn't work when at the beginning of the test itself
window.localStorage.__proto__.getItem = jest.fn().mockImplementation((name) => {
  return name === 'scigateway:token' ? testToken : null;
});

describe('App', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App useSuspense={false} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  it('should show preloader when react-i18next is not ready', () => {
    render(<AppSansHoc t={jest.fn()} i18n={{}} tReady={false} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('loadMaintenanceState dispatched when maintenance changes', async () => {
    // mock so token verify succeeds
    (axios.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {},
      })
    );
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });

    jest.useFakeTimers();

    render(<AppSansHoc t={jest.fn()} i18n={{}} tReady={true} />);

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
    document.dispatchEvent(
      new CustomEvent('scigateway', {
        detail: registerRouteAction,
      })
    );

    // go to plugin page
    await fireEvent.click(screen.getByRole('link', { name: 'Test plugin' }));

    expect(document.getElementById('test_plugin')).toBeInTheDocument();

    expect(screen.queryByText('Maintenance')).not.toBeInTheDocument();

    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          show: true,
          message: 'test message',
        },
      })
    );

    jest.runOnlyPendingTimers();

    await act(async () => {
      await flushPromises();
    });

    expect(screen.getByText('Maintenance')).toBeInTheDocument();
    expect(screen.getByText('test message')).toBeInTheDocument();
  });
});
