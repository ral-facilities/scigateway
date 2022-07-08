import React from 'react';
import { shallow } from 'enzyme';
import { UnconnectedContactUs, ContactUsProps } from './contactUs.component';

describe('Contact us component', () => {
  let props: ContactUsProps;

  it('renders iframe correctly if form url set', () => {
    props = {
      contactUsAccessibilityFormUrl: 'test-url',
    };

    const wrapper = shallow(<UnconnectedContactUs {...props} />);

    expect(wrapper.find('#contact-us-form')).toBeTruthy();
  });

  it('renders mailto link correctly if form url not set', () => {
    props = {
      contactUsAccessibilityFormUrl: '',
    };
    let wrapper = shallow(<UnconnectedContactUs {...props} />);
    expect(wrapper.find('#contact-info')).toBeTruthy();

    props = {
      contactUsAccessibilityFormUrl: undefined,
    };
    wrapper = shallow(<UnconnectedContactUs {...props} />);
    expect(wrapper.find('#contact-info')).toBeTruthy();
  });
});
