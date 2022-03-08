import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import {
  AccessibiiltyPageWithStyles,
  CombinedAccessibiiltyPageProps,
} from './accessibilityPage.component';
import { MuiThemeProvider } from '@material-ui/core';
import { buildTheme } from '../theming';

const dummyClasses = {
  root: 'root-class',
  container: 'container-class',
  titleText: 'titleText-class',
  description: 'description-class',
};

describe('Help page component', () => {
  let mount;
  let props: CombinedAccessibiiltyPageProps;

  beforeEach(() => {
    mount = createMount();

    props = {
      classes: dummyClasses,
    };
  });

  const theme = buildTheme(false);

  it('should render correctly', () => {
    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <AccessibiiltyPageWithStyles {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
