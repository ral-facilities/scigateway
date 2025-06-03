import React from 'react';
import {
  CombinedHelpPageProps,
  TableOfContents,
  UnconnectedHelpPage,
} from './helpPage.component';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { buildTheme } from '../theming';

vi.mock('../hooks/useAnchor', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('Help page component', () => {
  let props: CombinedHelpPageProps;

  beforeEach(() => {
    props = {
      res: undefined,
    };
  });

  it('should render correctly', () => {
    const { asFragment } = render(
      <ThemeProvider theme={buildTheme(false)}>
        <UnconnectedHelpPage {...props} />
      </ThemeProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render TOC correctly with nested headers', () => {
    props.res = {
      contents:
        "<h2 id='test nested toc item 1'>Nested TOC item</h2>Lorem ipsum dolor sit amet<h3 id='test nested toc item 2'>Nested TOC item 2</h3>consectetur adipiscing elit<br><h2 id='test nested toc item 3'>Nested TOC item 3</h2>Proin suscipit sed nisi ac consectetur",
    };
    const { asFragment } = render(<TableOfContents {...props} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should back to top elements next to each header', () => {
    props.res = {
      contents:
        "<h2 id='test nested toc item 1'>Nested TOC item</h2>Lorem ipsum dolor sit amet<h3 id='test nested toc item 2'>Nested TOC item 2</h3>consectetur adipiscing elit<br><h2 id='test nested toc item 3'>Nested TOC item 3</h2>Proin suscipit sed nisi ac consectetur",
    };
    const { asFragment } = render(
      <ThemeProvider theme={buildTheme(false)}>
        <UnconnectedHelpPage {...props} />
      </ThemeProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
