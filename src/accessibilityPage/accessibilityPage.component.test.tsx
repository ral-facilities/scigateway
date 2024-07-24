import React from 'react';
import AccessibilityPage from './accessibilityPage.component';
import { buildTheme } from '../theming';
import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { StateType } from '../state/state.types';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

describe('Accessibility page component', () => {
  const theme = buildTheme(false);
  let state: StateType;

  beforeEach(() => {
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/') },
    };
  });

  it('should render correctly and display contact us component', () => {
    const { asFragment } = render(
      <Provider store={configureStore([thunk])(state)}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <AccessibilityPage />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
