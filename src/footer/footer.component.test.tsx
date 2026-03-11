import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { buildTheme } from '../theming';
import Footer from './footer.component';

describe('Footer component', () => {
  it('footer renders correctly', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <ThemeProvider theme={buildTheme(false)}>
          <Footer />
        </ThemeProvider>
      </BrowserRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
