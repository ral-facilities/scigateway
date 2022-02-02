import React from 'react';

import { shallow } from 'enzyme';

import HomePage from './homePage.component';

describe('Home page component', () => {
  it('homepage renders correctly', () => {
    const wrapper = shallow(<HomePage />);
    expect(wrapper).toMatchSnapshot();
  });
});
