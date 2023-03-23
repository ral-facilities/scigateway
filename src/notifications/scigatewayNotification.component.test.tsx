import React from 'react';
import Notification from './scigatewayNotification.component';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { buildTheme } from '../theming';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function createScigatewayNotification(
  severity: string,
  message: string
): React.ReactElement {
  return (
    <Notification
      message={message}
      severity={severity}
      index={0}
      dismissNotification={jest.fn()}
    />
  );
}

describe('Scigateway Notification component', () => {
  function Wrapper({
    children,
  }: {
    children: React.ReactElement;
  }): JSX.Element {
    return (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={buildTheme(false)}>{children}</ThemeProvider>
      </StyledEngineProvider>
    );
  }

  it('Scigateway Notification success message renders correctly', () => {
    const { asFragment } = render(
      createScigatewayNotification('success', 'success message'),
      { wrapper: Wrapper }
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('Scigateway Notification warning message renders correctly', () => {
    const { asFragment } = render(
      createScigatewayNotification('warning', 'warning message'),
      { wrapper: Wrapper }
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('Scigateway Notification error message renders correctly', () => {
    const { asFragment } = render(
      createScigatewayNotification('error', 'error message'),
      { wrapper: Wrapper }
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('an action is fired when Scigateway Notification button is clicked', async () => {
    const mockDismissFn = jest.fn();
    const user = userEvent.setup();

    render(
      <Notification
        message="warning message"
        severity="warning"
        index={0}
        dismissNotification={mockDismissFn}
      />,
      { wrapper: Wrapper }
    );

    await user.click(
      screen.getByRole('button', { name: 'Dismiss notification' })
    );

    expect(mockDismissFn.mock.calls.length).toEqual(1);
  });
});
