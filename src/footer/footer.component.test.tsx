import React from 'react';
import { FooterWithoutRedux, FooterProps } from './footer.component';
import { shallow } from 'enzyme';

describe('Footer component', () => {
  let props: FooterProps;

  beforeEach(() => {
    props = {
      res: undefined,
    };
  });

  it('footer renders correctly', () => {
    const wrapper = shallow(<FooterWithoutRedux {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
