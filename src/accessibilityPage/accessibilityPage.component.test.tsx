import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { StateType } from '../state/state.types';
import { buildTheme } from '../theming';
import AccessibilityPage from './accessibilityPage.component';

describe('Accessibility page component', () => {
  const theme = buildTheme(false);
  let state: StateType;

  beforeEach(() => {
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
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
