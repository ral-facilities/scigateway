import React from 'react';
import { mount } from 'enzyme';
import AccessibilityPage from './accessibilityPage.component';
import { buildTheme } from '../theming';
import { StyledEngineProvider, ThemeProvider } from '@mui/material';

describe('Accessibility page component', () => {
  const theme = buildTheme(false);

  it('should render correctly', () => {
    const wrapper = mount(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <AccessibilityPage />
        </ThemeProvider>
      </StyledEngineProvider>
    );

    expect(wrapper.find('#accessibility-page')).toBeTruthy();
  });
});
