import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import { NotificationBadgeWithStyles } from './notificationBadge.component';
import { MuiThemeProvider } from '@material-ui/core';
import { buildTheme } from '../theming';
import { Action } from 'redux';

describe('Notification Badge component', () => {
  let shallow;

  beforeEach(() => {
    shallow = createShallow({});
  });

  const theme = buildTheme();

  it('Notification badge renders correctly', () => {
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <NotificationBadgeWithStyles
          notifications={[{ message: 'my message', severity: 'warning' }]}
          deleteMenuItem={(): Action => ({ type: test })}
        />
      </MuiThemeProvider>
    );

    expect(wrapper.dive().dive()).toMatchSnapshot();
  });
});
