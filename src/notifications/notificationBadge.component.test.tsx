import React from 'react';
import { act } from 'react-dom/test-utils';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import NotificationBadge, {
  NotificationBadgeWithStyles,
} from './notificationBadge.component';
import Badge from '@material-ui/core/Badge';
import { MuiThemeProvider } from '@material-ui/core';
import { buildTheme } from '../theming';
import { Action } from 'redux';
import configureStore from 'redux-mock-store';
import { initialState } from '../state/reducers/scigateway.reducer';
import { dismissMenuItem } from '../state/actions/scigateway.actions';

describe('Notification Badge component', () => {
  let shallow;
  let mount;
  let mockStore;

  beforeEach(() => {
    shallow = createShallow({});
    mount = createMount();
    mockStore = configureStore();
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

  it('renders correct number of notifications in the badge', () => {
    let wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <NotificationBadgeWithStyles
          notifications={[
            { message: 'my message', severity: 'warning' },
            { message: 'my other message', severity: 'success' },
          ]}
          deleteMenuItem={(): Action => ({ type: test })}
        />
      </MuiThemeProvider>
    );

    expect(
      wrapper
        .dive()
        .dive()
        .find(Badge)
        .prop('badgeContent')
    ).toEqual(2);

    wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <NotificationBadgeWithStyles
          deleteMenuItem={(): Action => ({ type: test })}
        />
      </MuiThemeProvider>
    );

    expect(
      wrapper
        .dive()
        .dive()
        .find(Badge)
        .prop('badgeContent')
    ).toBeNull();
  });

  it('sends dismissMenuItem action when dismissNotification prop is called', () => {
    let state = { scigateway: initialState };
    state.scigateway.notifications = [
      { message: 'my message', severity: 'warning' },
    ];
    const testStore = mockStore(state);

    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <NotificationBadge store={testStore} />
      </MuiThemeProvider>
    );

    wrapper
      .dive()
      .dive()
      .dive()
      .find('#notifications-menu [dismissNotification]')
      .prop('dismissNotification')();

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(dismissMenuItem(0));
  });

  it('opens menu when button clicked and closes menu when there are no more notifications', () => {
    //TODO: when enzyme supports hooks, change test to shallow and test the menuAnchor state
    let props = {
      notifications: [{ message: 'my message', severity: 'warning' }],
      deleteMenuItem: (): Action => ({ type: test }),
    };

    const wrapper = mount(
      React.createElement(
        props => (
          <MuiThemeProvider theme={theme}>
            <NotificationBadgeWithStyles {...props} />
          </MuiThemeProvider>
        ),
        props
      )
    );

    act(() => {
      wrapper
        .find('.NotificationBadge-button-1')
        .first()
        .prop('onClick')(
        wrapper
          .find('.NotificationBadge-button-1')
          .first()
          .getDOMNode()
      );
    });

    expect(wrapper.find('#notifications-menu').exists()).toBeTruthy();

    wrapper.setProps({ notifications: [] });

    expect(wrapper.find('#notifications-menu').exists()).toBeFalsy();
  });
});
