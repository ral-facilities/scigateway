import React from 'react';
import {
  UnconnectedHelpPage,
  CombinedHelpPageProps,
  TableOfContents,
} from './helpPage.component';
import { shallow } from 'enzyme';

describe('Help page component', () => {
  let props: CombinedHelpPageProps;

  beforeEach(() => {
    props = {
      res: undefined,
    };
  });

  it('should render correctly', () => {
    const wrapper = shallow(<UnconnectedHelpPage {...props} />);
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
    const wrapper = shallow(<UnconnectedHelpPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
