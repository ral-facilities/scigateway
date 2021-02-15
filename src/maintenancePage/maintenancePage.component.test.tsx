import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import {
  CombinedMaintenancePageProps,
  MaintenancePageWithStyles,
} from './maintenancePage.component';

const dummyClasses = {
  root: 'root-class',
  container: 'container-class',
  titleText: 'titleText-class',
};

describe('Maintenance page component', () => {
  let mount;
  let props: CombinedMaintenancePageProps;

  beforeEach(() => {
    mount = createMount();

    props = {
      message: 'test',
      classes: dummyClasses,
    };
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('should render correctly', () => {
    const wrapper = mount(<MaintenancePageWithStyles {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
