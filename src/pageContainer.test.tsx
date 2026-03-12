import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';

import { BrowserRouter } from 'react-router';

import { ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import PageContainer from './pageContainer.component';
import { authState, initialState } from './state/reducers/scigateway.reducer';
import { StateType } from './state/state.types';
import { buildTheme } from './theming';

vi.mock('@mui/material', async () => ({
  __esmodule: true,
  ...(await vi.importActual('@mui/material')),
  useMediaQuery: vi.fn(() => true),
}));

describe('PageContainer - Tests', () => {
  let state: StateType;

  beforeEach(() => {
    state = {
      scigateway: {
        ...initialState,
        authorisation: { ...authState },
        plugins: [
          {
            displayName: 'test',
            plugin: 'test',
            order: 1,
            link: '/test',
            section: 'Test',
          },
        ],
      },
    };
  });

  it('renders correctly', () => {
    const { asFragment } = render(
      <Provider store={configureStore([thunk])(state)}>
        <ThemeProvider theme={buildTheme(false)}>
          <BrowserRouter initialEntries={[{ key: 'testKey' }]}>
            <PageContainer />
          </BrowserRouter>
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
          <BrowserRouter initialEntries={[{ key: 'testKey' }]}>
            <PageContainer />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    );

    const element = screen.getByLabelText('home-page');
    await userEvent.type(element, '{Escape}');
    expect(cleanSpy).toHaveBeenCalled();
    cleanSpy.mockRestore();
  });
});
