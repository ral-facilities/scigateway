import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { shallow } from 'enzyme';
import {
  CombinedHelpPageProps,
  HelpPageWithoutStyles,
  HelpPageWithStyles,
  TableOfContents,
} from './helpPage.component';
import { MuiThemeProvider } from '@material-ui/core';
import { buildTheme } from '../theming';

const dummyClasses = {
  root: 'root-class',
  container: 'container-class',
  titleText: 'titleText-class',
  description: 'description-class',
  toc: 'toc-class',
};

jest.mock('../hooks/useAnchor', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('Help page component', () => {
  let mount;
  let props: CombinedHelpPageProps;

  beforeEach(() => {
    mount = createMount();

    props = {
      res: undefined,
      classes: dummyClasses,
    };
  });

  const theme = buildTheme(false);

  it('should render correctly', () => {
    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <HelpPageWithStyles {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render TOC correctly with nested headers', () => {
    props.res = {
      contents:
        "<h2 id='test nested toc item 1'>Nested TOC item</h2>Lorem ipsum dolor sit amet<h3 id='test nested toc item 2'>Nested TOC item 2</h3>consectetur adipiscing elit<br><h2 id='test nested toc item 3'>Nested TOC item 3</h2>Proin suscipit sed nisi ac consectetur",
    };
    const wrapper = shallow(<TableOfContents {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should back to top elements next to each header', () => {
    props.res = {
      contents:
        "<h2 id='test nested toc item 1'>Nested TOC item</h2>Lorem ipsum dolor sit amet<h3 id='test nested toc item 2'>Nested TOC item 2</h3>consectetur adipiscing elit<br><h2 id='test nested toc item 3'>Nested TOC item 3</h2>Proin suscipit sed nisi ac consectetur",
    };
    const wrapper = shallow(<HelpPageWithoutStyles {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
