import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import {
  ContactUsWithoutStyles,
  CombinedContactUsProps,
} from './contactUs.component';

describe('Contact us component', () => {
  let shallow;
  let props: CombinedContactUsProps;

  const dummyClasses = {
    description: 'description-class',
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'ContactUs' });
  });

  it('renders iframe correctly if form url set', () => {
    props = {
      contactUsAccessibilityFormUrl: 'test-url',
      classes: dummyClasses,
    };

    const wrapper = shallow(<ContactUsWithoutStyles {...props} />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('#contact-us-form')).toBeTruthy();
  });

  it('renders mailto link correctly if form url not set', () => {
    props = {
      contactUsAccessibilityFormUrl: '',
      classes: dummyClasses,
    };

    const wrapper = shallow(<ContactUsWithoutStyles {...props} />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('#contact-info')).toBeTruthy();
  });
});
