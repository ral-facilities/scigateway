import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import HomePage from './homePage.component';
import { MuiThemeProvider } from '@material-ui/core';
import { buildTheme } from '../theming';

describe('Home page component', () => {
  let shallow;

  const theme = buildTheme();

  beforeEach(() => {
    shallow = createShallow({});
  });

  it('homepage renders correctly', () => {
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <HomePage />
      </MuiThemeProvider>
    );

    expect(wrapper.dive().dive()).toMatchSnapshot();
  });
});
