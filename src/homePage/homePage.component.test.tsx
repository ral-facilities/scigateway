import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { buildTheme } from '../theming';
import HomePage from './homePage.component';

vi.mock('@mui/material', async () => ({
  __esmodule: true,
  ...(await vi.importActual('@mui/material')),
  useMediaQuery: vi.fn(() => true),
}));

describe('Home page component', () => {
  it('homepage renders correctly', () => {
    const { asFragment } = render(
      <ThemeProvider theme={buildTheme(false)}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </ThemeProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
