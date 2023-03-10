import React from 'react';
import Preloader from './preloader.component';
import configureStore, { MockStore } from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import { createTheme } from '@mui/material/styles';

describe('Preloader component', () => {
  let mockStore: MockStore;
  let state: StateType;

  function Wrapper({
    children,
  }: {
    children: React.ReactElement;
  }): JSX.Element {
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
      router: {
        action: 'POP',
        location: createLocation('/'),
      },
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
