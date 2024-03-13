import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { buildTheme } from '../theming';
import Footer from './footer.component';

describe('Footer component', () => {
  it('footer renders correctly', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <ThemeProvider theme={buildTheme(false)}>
          <Footer />
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
