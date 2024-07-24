import React from 'react';
import NotificationBadge from './notificationBadge.component';
import { ThemeProvider } from '@mui/material/styles';
import { buildTheme } from '../theming';
import configureStore, { MockStore } from 'redux-mock-store';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { dismissMenuItem } from '../state/actions/scigateway.actions';
import { Provider } from 'react-redux';
import { StateType } from '../state/state.types';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Notification Badge component', () => {
  const theme = buildTheme(false);

  let testStore: MockStore;
  let state: StateType;

  function Wrapper({
    children,
  }: {
    children: React.ReactElement;
  }): JSX.Element {
    return (
      <Provider store={testStore}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </Provider>
    );
  }

  beforeEach(() => {
    state = {
      scigateway: {
        ...initialState,
        authorisation: { ...authState },
        notifications: [
          { message: 'my message', severity: 'warning' },
          { message: 'my other message', severity: 'success' },
        ],
      },
    };
    testStore = configureStore()(state);
  });

  it('Notification badge renders correctly', () => {
    render(<NotificationBadge />, { wrapper: Wrapper });

    expect(
      screen.getByRole('button', { name: 'Open notification menu' })
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByRole('button', { name: 'Open notification menu' })
      ).getByLabelText('Notification count')
    ).toHaveTextContent('2');
  });

  it('sends dismissMenuItem action when dismissNotification prop is called', async () => {
    const user = userEvent.setup();

    render(<NotificationBadge />, { wrapper: Wrapper });

    await user.click(
      screen.getByRole('button', { name: 'Open notification menu' })
    );

    // dismiss first notification
    await user.click(
      (
        await screen.findAllByRole('button', { name: 'Dismiss notification' })
      )[0]
    );

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(dismissMenuItem(0));
  });

  it('opens menu when button clicked and closes menu when there are no more notifications', async () => {
    const user = userEvent.setup();

    const { rerender } = render(<NotificationBadge />, { wrapper: Wrapper });

    await user.click(
      screen.getByRole('button', { name: 'Open notification menu' })
    );

    expect(await screen.findByRole('menu')).toBeInTheDocument();

    state.scigateway.notifications = [];
    testStore = configureStore()(state);

    rerender(<NotificationBadge />);

    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens menu with no notifications message when button clicked and there are no notifications', async () => {
    const user = userEvent.setup();
    state.scigateway.notifications = [];

    render(<NotificationBadge />, { wrapper: Wrapper });

    await user.click(
      screen.getByRole('button', { name: 'Open notification menu' })
    );

    expect(
      within(await screen.findByRole('menu')).getByLabelText(
        'No notifications message'
      )
    ).toBeInTheDocument();
  });

  it('no notifications message disappears when a notification occurs', async () => {
    const user = userEvent.setup();
    const notifications = state.scigateway.notifications;
    state.scigateway.notifications = [];

    const { rerender } = render(<NotificationBadge />, { wrapper: Wrapper });

    await user.click(
      screen.getByRole('button', { name: 'Open notification menu' })
    );

    expect(
      within(await screen.findByRole('menu')).getByLabelText(
        'No notifications message'
      )
    ).toBeInTheDocument();

    state.scigateway.notifications = notifications;
    testStore = configureStore()(state);

    rerender(<NotificationBadge />);

    const notificationMenu = screen.getByRole('menu');
    expect(notificationMenu).toBeInTheDocument();
    expect(
      within(notificationMenu).queryByLabelText('No notifications message')
    ).toBeNull();
  });

  it('no notifications message can be closed', async () => {
    const user = userEvent.setup();
    state.scigateway.notifications = [];

    render(<NotificationBadge />, { wrapper: Wrapper });

    //Check can close using close button
    await user.click(
      screen.getByRole('button', { name: 'Open notification menu' })
    );

    expect(
      within(await screen.findByRole('menu')).getByLabelText(
        'No notifications message'
      )
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Dismiss notification' })
    );

    expect(screen.queryByRole('menu')).toBeNull();
  });
});
