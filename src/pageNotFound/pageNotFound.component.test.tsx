import React from 'react';
import PageNotFound from './pageNotFound.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';

describe('Page Not found component', () => {
  let shallow;
  let mount;

  beforeEach(() => {
    shallow = createShallow({});
    mount = createMount();
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('app bar renders correctly', () => {
    const wrapper = shallow(<PageNotFound />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
