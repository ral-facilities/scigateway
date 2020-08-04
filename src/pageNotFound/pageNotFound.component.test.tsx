import React from 'react';
import { PageNotFoundWithoutStyles } from './pageNotFound.component';
import { createShallow } from '@material-ui/core/test-utils';

describe('Page Not found component', () => {
  let shallow;
  const props = {
    classes: {
      titleContainer: 'title-container-class',
      bugIcon: 'bug-icon-class',
      codeText: 'code-text-class',
      container: 'container-class',
      bold: 'bold-class',
      message: 'message-class',
    },
  };
  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
  });

  it('pageNotFound renders correctly', () => {
    const wrapper = shallow(<PageNotFoundWithoutStyles {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
