import React from 'react';
import { UnconnectedFooter, FooterProps } from './footer.component';
import { shallow } from 'enzyme';

describe('Footer component', () => {
  let props: FooterProps;

  beforeEach(() => {
    props = {
      res: undefined,
    };
  });

  it('footer renders correctly', () => {
    const wrapper = shallow(<UnconnectedFooter {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
