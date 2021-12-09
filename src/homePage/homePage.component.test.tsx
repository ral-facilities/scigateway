import React from 'react';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import HomePage from './homePage.component';

describe('Home page component', () => {
  let shallow;
  let mount;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('homepage renders correctly', () => {
    const wrapper = shallow(<HomePage />);
    expect(wrapper).toMatchSnapshot();
  });
});
