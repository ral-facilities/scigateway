import React from 'react';
import { mount } from 'enzyme';
import AccessibilityPage from './accessibilityPage.component';
import { buildTheme } from '../theming';
import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { StateType } from '../state/state.types';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

describe('Accessibility page component', () => {
  const theme = buildTheme(false);
  let state: StateType;
  let mockStore;

  beforeEach(() => {
    mockStore = configureStore([thunk]);
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/') },
    };
  });

  it('should render correctly and display contact us component', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <AccessibilityPage />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    expect(wrapper.find('#accessibility-page')).toBeTruthy();
    expect(wrapper.find('#contact-us')).toBeTruthy();
  });
});
