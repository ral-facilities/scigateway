import React from 'react';
import { configure, addDecorator } from '@storybook/react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import StoryRouter from 'storybook-react-router';
import { buildTheme } from '../theming';

const req = require.context('./', true, /\.stories\.tsx$/);

const MaterialUIThemeDecorator = (storyFn) => (
  <MuiThemeProvider theme={buildTheme()}>{storyFn()}</MuiThemeProvider>
);
addDecorator(MaterialUIThemeDecorator);
addDecorator(StoryRouter());

function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
