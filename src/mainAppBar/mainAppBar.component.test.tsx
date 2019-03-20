import React from 'react';
import MainAppBarComponent, { MenuButton } from './mainAppBar.component';
import { createShallow } from '@material-ui/core/test-utils';

describe('Main app bar component', () => {
  let shallow;

  beforeEach(() => {
    shallow = createShallow({});
  });

  it('app bar renders correctly', () => {
    const wrapper = shallow(<MainAppBarComponent />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('MenuButton renders correctly', () => {
    const wrapper = shallow(
      <MenuButton buttonText="test" buttonClassName="test-class-1" />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
