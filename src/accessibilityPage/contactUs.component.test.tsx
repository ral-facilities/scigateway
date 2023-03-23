import React from 'react';
import { UnconnectedContactUs } from './contactUs.component';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { buildTheme } from '../theming';

describe('Contact us component', () => {
  const testTheme = buildTheme(false);

  it('renders iframe correctly if form url set', () => {
    render(
      <ThemeProvider theme={testTheme}>
        <UnconnectedContactUs contactUsAccessibilityFormUrl="test-url" />
      </ThemeProvider>
    );

    expect(screen.getByTestId('contact-us-form')).toBeInTheDocument();
  });

  it('renders mailto link correctly if form url not set', () => {
    render(
      <ThemeProvider theme={testTheme}>
        <UnconnectedContactUs contactUsAccessibilityFormUrl="" />
      </ThemeProvider>
    );

    expect(
      screen.getByRole('link', { name: 'accessibility-page.contact-info' })
    ).toHaveAttribute('href', 'mailto:accessibility-page.contact-info');
  });
});
