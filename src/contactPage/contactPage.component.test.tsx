import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import {
  ContactPageWithStyles,
  CombinedContactPageProps,
} from './contactPage.component';
import { MuiThemeProvider } from '@material-ui/core';
import { buildTheme } from '../theming';

const dummyClasses = {
  root: 'root-class',
  container: 'container-class',
  titleText: 'titleText-class',
  contactDetails: 'contactDetails-class',
};

describe('Contact page componet', () => {
  let mount;
  let props: CombinedContactPageProps;

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
        <ContactPageWithStyles {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
