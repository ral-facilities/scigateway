import React from 'react';
import Notification from './scigatewayNotification.component';
import { Action } from 'redux';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { mount, shallow } from 'enzyme';

function createScigatewayNotification(
  severity: string,
  message: string
): React.ReactElement {
  return (
    <Notification
      message={message}
      severity={severity}
      index={0}
      dismissNotification={(): Action => ({ type: 'test' })}
    />
  );
}

describe('Scigateway Notification component', () => {
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
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Notification
            message={'warning message'}
            severity={'warning'}
            index={0}
            dismissNotification={mockDismissFn}
          />
        </ThemeProvider>
      </StyledEngineProvider>
    );

    wrapper.find('button').simulate('click');

    expect(mockDismissFn.mock.calls.length).toEqual(1);
  });
});
