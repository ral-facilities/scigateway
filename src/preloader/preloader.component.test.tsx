import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore, { MockStore } from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { StateType } from '../state/state.types';
import Preloader from './preloader.component';

describe('Preloader component', () => {
  let mockStore: MockStore;
  let state: StateType;

  function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
    return (
      <Provider store={configureStore([thunk])(state)}>
        <Provider store={mockStore}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={createTheme(false)}>{children}</ThemeProvider>
          </StyledEngineProvider>
        </Provider>
      </Provider>
    );
  }

  beforeEach(() => {
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
    };
    mockStore = configureStore()(state);
  });

  it('renders fullscreen correctly', () => {
    state.scigateway.siteLoading = true;

    const { asFragment } = render(<Preloader fullScreen />, {
      wrapper: Wrapper,
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders not fullscreen correctly', () => {
    const { asFragment } = render(<Preloader fullScreen={false} />, {
      wrapper: Wrapper,
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it('does not render when loading is false', () => {
    state.scigateway.siteLoading = false;

    const { asFragment } = render(<Preloader />, { wrapper: Wrapper });
    expect(asFragment()).toMatchSnapshot();
  });
});
