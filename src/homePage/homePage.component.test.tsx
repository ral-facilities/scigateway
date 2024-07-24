import React from 'react';

import HomePage from './homePage.component';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { buildTheme } from '../theming';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@mui/material', () => ({
  __esmodule: true,
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(() => true),
}));

describe('Home page component', () => {
  it('homepage renders correctly', () => {
    const { asFragment } = render(
      <ThemeProvider theme={buildTheme(false)}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </ThemeProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
