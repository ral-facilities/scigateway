import React from 'react';
import {
  UnconnectedHelpPage,
  CombinedHelpPageProps,
} from './helpPage.component';
import { shallow } from 'enzyme';

describe('Help page component', () => {
  let props: CombinedHelpPageProps;

  beforeEach(() => {
    props = {
      res: undefined,
    };
  });

  it('should render correctly', () => {
    const wrapper = shallow(<UnconnectedHelpPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
