import React from 'react';
import { act } from 'react-dom/test-utils';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import NotificationBadge, {
  NotificationBadgeWithoutStyles,
  CombinedNotificationBadgeProps,
} from './notificationBadge.component';
import Badge from '@material-ui/core/Badge';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { buildTheme } from '../theming';
import { Action } from 'redux';
import configureStore from 'redux-mock-store';
import { initialState } from '../state/reducers/scigateway.reducer';
import { dismissMenuItem } from '../state/actions/scigateway.actions';
import { Provider } from 'react-redux';

describe('Notification Badge component', () => {
  const theme = buildTheme();

  let shallow;
  let mount;
  let mockStore;
  let props: CombinedNotificationBadgeProps;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
    mockStore = configureStore();

    props = {
      notifications: [],
      deleteMenuItem: jest.fn(),
      classes: {
        button: 'button-class',
        badge: 'badge-class',
      },
    };
  });

  it('Notification badge renders correctly', () => {
    const wrapper = shallow(
      <NotificationBadgeWithoutStyles
        notifications={[{ message: 'my message', severity: 'warning' }]}
        deleteMenuItem={(): Action => ({ type: test })}
        {...props}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correct number of notifications in the badge', () => {
    let wrapper = shallow(
      <NotificationBadgeWithoutStyles
        notifications={[
          { message: 'my message', severity: 'warning' },
          { message: 'my other message', severity: 'success' },
        ]}
        deleteMenuItem={(): Action => ({ type: test })}
        classes={props.classes}
      />
    );

    expect(wrapper.find(Badge).prop('badgeContent')).toEqual(2);

    wrapper = shallow(
      <NotificationBadgeWithoutStyles
        {...props}
        deleteMenuItem={(): Action => ({ type: test })}
      />
    );

    expect(wrapper.find(Badge).prop('badgeContent')).toBeNull();
  });

  it('sends dismissMenuItem action when dismissNotification prop is called', () => {
    let state = { scigateway: initialState };
    state.scigateway.notifications = [
      { message: 'my message', severity: 'warning' },
    ];
    const testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <MuiThemeProvider theme={theme}>
          <NotificationBadge />
        </MuiThemeProvider>
      </Provider>
    );

    wrapper
      .find('[aria-label="Open notification menu"]')
      .first()
      .simulate('click');
    wrapper.update();
    // console.log(wrapper.find('#notifications-menu').debug());

    wrapper
      .find('[aria-label="Dismiss notification"]')
      .first()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(dismissMenuItem(0));
  });

  it('opens menu when button clicked and closes menu when there are no more notifications', () => {
    let state = { scigateway: initialState };
    state.scigateway.notifications = [
      { message: 'my message', severity: 'warning' },
    ];

    let testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <MuiThemeProvider theme={theme}>
          <NotificationBadge />
        </MuiThemeProvider>
      </Provider>
    );

    act(() => {
      wrapper
        .find('[aria-label="Open notification menu"]')
        .first()
        .prop('onClick')({
        currentTarget: wrapper
          .find('[aria-label="Open notification menu"]')
          .first()
          .getDOMNode(),
      });
    });

    expect(wrapper.find('#notifications-menu').exists()).toBeTruthy();

    state.scigateway.notifications = [];
    testStore = mockStore(state);
    wrapper.setProps({ store: testStore });

    expect(wrapper.find('#notifications-menu').exists()).toBeFalsy();
  });
});
