import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import {
  HelpPageWithoutStyles,
  CombinedHelpPageProps,
} from './helpPage.component';

describe('Help page component', () => {
  let shallow;
  let props: CombinedHelpPageProps;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'HelpPage' });

    props = {
      res: undefined,
      classes: {
        root: 'root-class',
        container: 'container-class',
        titleText: 'titleText-class',
        description: 'description-class',
      },
    };
  });

  it('should render correctly', () => {
    const wrapper = shallow(<HelpPageWithoutStyles {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
