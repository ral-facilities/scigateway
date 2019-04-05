import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import HomePage from './homePage.component';

describe('Login page component', () => {
  let shallow;

  beforeEach(() => {
    shallow = createShallow({});
  });

  it('homepage renders correctly', () => {
    const wrapper = shallow(<HomePage />);
    expect(wrapper).toMatchSnapshot();
  });
});
