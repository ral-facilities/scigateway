import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { NotificationWithStyles } from './scigatewayNotification.component';
import { Action } from 'redux';
import { buildTheme } from '../theming';
import { MuiThemeProvider } from '@material-ui/core';

const theme = buildTheme();

function createScigatewayNotification(
  severity: string,
  message: string
): React.ReactElement {
  return (
    <MuiThemeProvider theme={theme}>
      <NotificationWithStyles
        message={message}
        severity={severity}
        index={0}
        dismissNotification={(): Action => ({ type: 'test' })}
      />
    </MuiThemeProvider>
  );
}

describe('Scigateway Notification component', () => {
  let shallow;
  let mount;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('Scigateway Notification success message renders correctly', () => {
    const wrapper = shallow(
      createScigatewayNotification('success', 'success message')
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('Scigateway Notification warning message renders correctly', () => {
    const wrapper = shallow(
      createScigatewayNotification('warning', 'warning message')
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('Scigateway Notification error message renders correctly', () => {
    const wrapper = shallow(
      createScigatewayNotification('error', 'error message')
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('an action is fired when Scigateway Notification button is clicked', () => {
    const mockDismissFn = jest.fn();

    const wrapper = mount(
      <MuiThemeProvider theme={theme}>
        <NotificationWithStyles
          message={'warning message'}
          severity={'warning'}
          index={0}
          dismissNotification={mockDismissFn}
        />
      </MuiThemeProvider>
    );

    wrapper.find('button').simulate('click');

    expect(mockDismissFn.mock.calls.length).toEqual(1);
  });
});
