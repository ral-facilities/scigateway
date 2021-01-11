import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import {
  ContactPageWithoutStyles,
  CombinedContactPageProps,
} from './contactPage.component';

describe('Contact page componet', () => {
  let shallow;
  let props: CombinedContactPageProps;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'ContactPage' });

    props = {
      res: undefined,
      classes: {
        root: 'root-class',
        container: 'container-class',
        titleText: 'titleText-class',
        contactDetails: 'contactDetails-class',
      },
    };
  });

  it('should render correctly', () => {
    const wrapper = shallow(<ContactPageWithoutStyles {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
