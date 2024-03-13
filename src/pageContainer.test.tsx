import React from 'react';

import { thunk } from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { createLocation } from 'history';
import { MemoryRouter } from 'react-router-dom';

import PageContainer from './pageContainer.component';
import { StateType } from './state/state.types';
import { authState, initialState } from './state/reducers/scigateway.reducer';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material';
import { buildTheme } from './theming';
import { toastr } from 'react-redux-toastr';
import userEvent from '@testing-library/user-event';

vi.mock('@mui/material', async () => ({
  __esmodule: true,
  ...(await vi.importActual('@mui/material')),
  useMediaQuery: vi.fn(() => true),
}));

describe('PageContainer - Tests', () => {
  let state: StateType;

  beforeEach(() => {
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/') },
    };
  });

  it('renders correctly', () => {
    const { asFragment } = render(
      <Provider store={configureStore([thunk])(state)}>
        <ThemeProvider theme={buildTheme(false)}>
          <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
            <PageContainer />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('calls toastr.clean() when escape is clicked', async () => {
    const cleanSpy = vi.spyOn(toastr, 'clean');
    render(
      <Provider store={configureStore([thunk])(state)}>
        <ThemeProvider theme={buildTheme(false)}>
          <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
            <PageContainer />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    const element = screen.getByLabelText('home-page');
    await userEvent.type(element, '{Escape}');
    expect(cleanSpy).toHaveBeenCalled();
    cleanSpy.mockRestore();
  });
});
