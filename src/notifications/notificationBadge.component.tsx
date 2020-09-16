import React, { useState } from 'react';
import { connect } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import NotificationsIcon from '@material-ui/icons/Notifications';
import {
  Theme,
  WithStyles,
  withStyles,
  Badge,
  Menu,
  createStyles,
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';
import { UKRITheme } from '../theming';
import { StateType, ScigatewayNotification } from '../state/state.types';
import { Dispatch, Action } from 'redux';
import { dismissMenuItem } from '../state/actions/scigateway.actions';
import { NotificationWithStyles } from './scigatewayNotification.component';

interface BadgeProps {
  notifications: ScigatewayNotification[];
}

interface BadgeDispatchProps {
  deleteMenuItem: (index: number) => Action;
}

const styles = (theme: Theme): StyleRules =>
  createStyles({
    button: {
      color: theme.palette.primary.contrastText,
    },
    badge: {
      background: (theme as UKRITheme).ukri.bright.orange,
    },
    menuItem: {
      display: 'flex',
    },
    message: {
      flexGrow: 1,
    },
  });

export type CombinedNotificationBadgeProps = BadgeProps &
  BadgeDispatchProps &
  WithStyles<typeof styles>;

function buildMenuItems(
  notifications: ScigatewayNotification[],
  dismissNotificationAction: (index: number) => Action
): JSX.Element[] {
  const menuItems = notifications.map((notification, index) => (
    <NotificationWithStyles
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

const NotificationBadge = (
  props: CombinedNotificationBadgeProps
): React.ReactElement => {
  const [getMenuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const closeMenu = (): void => setMenuAnchor(null);
  // Ensure menu is closed if no notifications, or all notifications are deleted
  if (getMenuAnchor !== null && props.notifications.length === 0) {
    closeMenu();
  }
  return (
    <div className="tour-notifications">
      <IconButton
        className={props.classes.button}
        onClick={(e) => setMenuAnchor(e.currentTarget)}
        aria-label="Open notification menu"
      >
        <Badge
          badgeContent={
            props.notifications.length > 0 ? props.notifications.length : null
          }
          color="primary"
          classes={{
            colorPrimary: props.classes.badge,
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      {props.notifications && props.notifications.length ? (
        <Menu
          id="notifications-menu"
          anchorEl={getMenuAnchor}
          open={getMenuAnchor !== null}
          onClose={closeMenu}
        >
          {buildMenuItems(props.notifications, props.deleteMenuItem)}
        </Menu>
      ) : null}
    </div>
  );
};

export const NotificationBadgeWithoutStyles = NotificationBadge;
export const NotificationBadgeWithStyles = withStyles(styles)(
  NotificationBadge
);

const mapStateToProps = (state: StateType): BadgeProps => ({
  notifications: state.scigateway.notifications,
});

const mapDispatchToProps = (dispatch: Dispatch): BadgeDispatchProps => ({
  deleteMenuItem: (index: number) => {
    return dispatch(dismissMenuItem(index));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationBadgeWithStyles);
