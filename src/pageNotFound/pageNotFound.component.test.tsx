import React from 'react';
import PageNotFound from './pageNotFound.component';
import { createShallow } from '@material-ui/core/test-utils';

describe('Page Not found component', () => {
  let shallow;

  beforeEach(() => {
    shallow = createShallow({});
  });

  it('pageNotFound renders correctly', () => {
    const wrapper = shallow(<PageNotFound />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
