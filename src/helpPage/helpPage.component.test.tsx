import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import {
  HelpPageWithStyles,
  CombinedHelpPageProps,
} from './helpPage.component';
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
  let props: CombinedHelpPageProps;

  beforeEach(() => {
    mount = createMount();

    props = {
      res: undefined,
      classes: dummyClasses,
    };
  });

  const theme = buildTheme(false);

  it('should render correctly', () => {
    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <HelpPageWithStyles {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
