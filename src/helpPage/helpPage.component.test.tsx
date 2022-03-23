import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { shallow } from 'enzyme';
import {
  HelpPageWithStyles,
  CombinedHelpPageProps,
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
  tocItem: 'tocItem-class',
};

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
      'logging-in-description':
        "Lorem ipsum dolor sit amet<br>consectetur adipiscing elit<br><h3 id='test nested toc item 1'>Nested TOC item</h3>Proin suscipit sed nisi ac consectetur",
      'my-data-description':
        "Lorem ipsum dolor sit amet<br>consectetur adipiscing elit<br><h3 id='test nested toc item 2'>Nested TOC item</h3>Proin suscipit sed nisi ac consectetur",
      'browse-description':
        "Lorem ipsum dolor sit amet<br>consectetur adipiscing elit<br><h3 id='test nested toc item 3'>Nested TOC item</h3>Proin suscipit sed nisi ac consectetur",
      'search-description':
        "Lorem ipsum dolor sit amet<br>consectetur adipiscing elit<br><h3 id='test nested toc item 4'>Nested TOC item</h3>Proin suscipit sed nisi ac consectetur",
      'cart-description':
        "Lorem ipsum dolor sit amet<br>consectetur adipiscing elit<br><h3 id='test nested toc item 5'>Nested TOC item</h3>Proin suscipit sed nisi ac consectetur",
      'download-description':
        "Lorem ipsum dolor sit amet<br>consectetur adipiscing elit<br><h3 id='test nested toc item 6'>Nested TOC item</h3>Proin suscipit sed nisi ac consectetur",
    };
    const wrapper = shallow(<TableOfContents {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
