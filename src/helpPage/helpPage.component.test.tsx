import React from 'react';
import { createMount } from '@mui/material/test-utils';
import {
  HelpPageWithStyles,
  CombinedHelpPageProps,
} from './helpPage.component';
import { ThemeProvider, StyledEngineProvider } from '@mui/material';
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
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <HelpPageWithStyles {...props} />
        </ThemeProvider>
      </StyledEngineProvider>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
