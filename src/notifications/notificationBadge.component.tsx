import React, { useState } from 'react';
import { connect } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Badge, Menu, Typography } from '@mui/material';
import { StateType, ScigatewayNotification } from '../state/state.types';
import { Dispatch, Action } from 'redux';
import { dismissMenuItem } from '../state/actions/scigateway.actions';
import Notification from './scigatewayNotification.component';
import { AppStrings } from '../state/scigateway.types';
import { getAppStrings, getString } from '../state/strings';
import DeleteIcon from '@mui/icons-material/Clear';

interface BadgeProps {
  notifications: ScigatewayNotification[];
  res: AppStrings | undefined;
}

interface BadgeDispatchProps {
  deleteMenuItem: (index: number) => Action;
}

export type CombinedNotificationBadgeProps = BadgeProps & BadgeDispatchProps;

function buildMenuItems(
  notifications: ScigatewayNotification[],
  dismissNotificationAction: (index: number) => Action
): JSX.Element[] {
  const menuItems = notifications.map((notification, index) => (
    <Notification
      dismissNotification={() => {
        return dismissNotificationAction(index);
      }}
      message={notification.message}
      severity={notification.severity}
      index={index}
      key={index}
    />
  ));
  return menuItems;
}

const NoNotificationsMessage = React.forwardRef(
  (
    props: {
      res: AppStrings | undefined;
      onClose: () => void;
    },
    ref: React.Ref<HTMLDivElement>
  ): React.ReactElement => {
    return (
      <div
        aria-label="No notifications message"
        ref={ref}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <Typography variant="body2" sx={{ marginLeft: '15px', marginTop: 0.5 }}>
          {getString(props.res, 'no-notifications')}
        </Typography>
        <IconButton
          sx={{ marginLeft: '5px', marginTop: '2px' }}
          onClick={props.onClose}
          aria-label="Dismiss notification"
          size="large"
        >
          <DeleteIcon sx={{ height: '15px', width: '15px' }} />
        </IconButton>
      </div>
    );
  }
);
NoNotificationsMessage.displayName = 'NoNotificationsMessage';

const NotificationBadge = (
  props: CombinedNotificationBadgeProps
): React.ReactElement => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);
  const [displayNoNotifications, setDisplayNoNotifications] = useState(false);
  const closeMenu = (): void => {
    setMenuAnchor(null);
    setDisplayNoNotifications(false);
  };
  const open = Boolean(menuAnchor);

  // Ensure menu is closed if no notifications, or all notifications are deleted and not displaying 'no notifications'
  if (!displayNoNotifications && open && props.notifications.length === 0) {
    closeMenu();
  }
  //Ensure 'no notifications' message does not display when there are notifications
  if (
    displayNoNotifications &&
    props.notifications &&
    props.notifications.length > 0
  ) {
    setDisplayNoNotifications(false);
  }

  return (
    <div className="tour-notifications">
      <IconButton
        sx={{ margin: 1, color: 'primary.contrastText' }}
        onClick={(e) => {
          setMenuAnchor(e.currentTarget);
          if (!props.notifications || props.notifications.length === 0)
            setDisplayNoNotifications(true);
        }}
        aria-label="Open notification menu"
        aria-controls={open ? 'notifications-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        size="large"
      >
        <Badge
          aria-label="Notification count"
          badgeContent={
            props.notifications.length > 0 ? props.notifications.length : null
          }
          color="primary"
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      {/* Only display menu if there is something to display */}
      {displayNoNotifications ||
      (props.notifications && props.notifications.length) ? (
        <Menu
          id="notifications-menu"
          anchorEl={menuAnchor}
          open={open}
          onClose={closeMenu}
        >
          {displayNoNotifications ? (
            <NoNotificationsMessage
              res={props.res}
              onClose={closeMenu}
            ></NoNotificationsMessage>
          ) : (
            buildMenuItems(props.notifications, props.deleteMenuItem)
          )}
        </Menu>
      ) : null}
    </div>
  );
};

const mapStateToProps = (state: StateType): BadgeProps => ({
  notifications: state.scigateway.notifications,
  res: getAppStrings(state, 'main-appbar'),
});

const mapDispatchToProps = (dispatch: Dispatch): BadgeDispatchProps => ({
  deleteMenuItem: (index: number) => {
    return dispatch(dismissMenuItem(index));
  },
});

export const UnconnectedNotificationBadge = NotificationBadge;

export default connect(mapStateToProps, mapDispatchToProps)(NotificationBadge);
