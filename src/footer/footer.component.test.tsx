import React from 'react';
import { FooterProps, UnconnectedFooter } from './footer.component';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { buildTheme } from '../theming';
import { MemoryRouter } from 'react-router-dom';

describe('Footer component', () => {
  let props: FooterProps;

  beforeEach(() => {
    props = {
      res: undefined,
    };
  });

  it('footer renders correctly', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <ThemeProvider theme={buildTheme(false)}>
          <UnconnectedFooter {...props} />
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
