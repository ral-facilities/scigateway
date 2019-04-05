import React from 'react';
import { configure, addDecorator } from '@storybook/react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';
import StoryRouter from 'storybook-react-router';

const req = require.context('./', true, /\.stories\.tsx$/);

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: blue,
  },
});

const MaterialUIThemeDecorator = storyFn => (
  <MuiThemeProvider theme={theme}>{storyFn()}</MuiThemeProvider>
);
addDecorator(MaterialUIThemeDecorator);
addDecorator(StoryRouter());

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
