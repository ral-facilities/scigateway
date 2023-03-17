import React from 'react';
import ReactDOM from 'react-dom';
import * as singleSpa from 'single-spa';
import App, { AppSansHoc } from './App';
import { render, screen } from '@testing-library/react';

describe('App', () => {
  beforeEach(() => {
    singleSpa.start();
  });

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

  it.skip('loadMaintenanceState dispatched when maintenance changes', async () => {
    // TODO: unsure how to test this since the store is no longer accessible
  });
});
