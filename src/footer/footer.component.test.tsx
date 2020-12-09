import React from 'react';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import { FooterWithoutStyles, CombinedFooterProps } from './footer.component';

describe('Footer component', () => {
  let shallow;
  let mount;
  let props: CombinedFooterProps;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();

    props = {
      res: undefined,
      classes: {
        root: 'root-class',
      },
    };
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('footer renders correctly', () => {
    const wrapper = shallow(<FooterWithoutStyles {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
