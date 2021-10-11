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
  makeStyles,
  Typography,
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';
import { StateType, ScigatewayNotification } from '../state/state.types';
import { Dispatch, Action } from 'redux';
import { dismissMenuItem } from '../state/actions/scigateway.actions';
import { NotificationWithStyles } from './scigatewayNotification.component';
import { AppStrings } from '../state/scigateway.types';
import { getAppStrings, getString } from '../state/strings';
import DeleteIcon from '@material-ui/icons/Clear';

interface BadgeProps {
  notifications: ScigatewayNotification[];
  res: AppStrings | undefined;
}

interface BadgeDispatchProps {
  deleteMenuItem: (index: number) => Action;
}

const styles = (theme: Theme): StyleRules =>
  createStyles({
    button: {
      color: theme.palette.primary.contrastText,
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

const useNoNotificationsStyles = makeStyles(
  (theme: Theme): StyleRules =>
    createStyles({
      root: {
        display: 'flex',
        alignItems: 'center',
      },
      text: {
        marginLeft: 15,
      },
      button: {
        marginLeft: 5,
      },
      deleteIcon: {
        height: 15,
        width: 15,
      },
    })
);

const NoNotificationsMessage = React.forwardRef(
  (
    props: {
      res: AppStrings | undefined;
      onClose: () => void;
    },
    ref: React.Ref<HTMLDivElement>
  ): React.ReactElement => {
    const classes = useNoNotificationsStyles();
    return (
      <div
        aria-label="No notifications message"
        ref={ref}
        className={classes.root}
      >
        <Typography variant="body2" className={classes.text}>
          {getString(props.res, 'no-notifications')}
        </Typography>
        <IconButton
          className={classes.button}
          onClick={props.onClose}
          aria-label="Dismiss notification"
        >
          <DeleteIcon className={classes.deleteIcon} />
        </IconButton>
      </div>
    );
  }
);
NoNotificationsMessage.displayName = 'NoNotificationsMessage';

const NotificationBadge = (
  props: CombinedNotificationBadgeProps
): React.ReactElement => {
  const [getMenuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [displayNoNotifications, setDisplayNoNotifications] = useState(false);
  const closeMenu = (): void => setMenuAnchor(null);
  // Ensure menu is closed if no notifications, or all notifications are deleted and not displaying 'no notifications'
  if (
    !displayNoNotifications &&
    getMenuAnchor !== null &&
    props.notifications.length === 0
  ) {
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
        className={props.classes.button}
        onClick={(e) => {
          if (!props.notifications || props.notifications.length === 0)
            setDisplayNoNotifications(true);
          setMenuAnchor(e.currentTarget);
        }}
        aria-label="Open notification menu"
      >
        <Badge
          badgeContent={
            props.notifications.length > 0 ? props.notifications.length : null
          }
          color="primary"
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
      {displayNoNotifications ? (
        <Menu
          id="notifications-menu"
          anchorEl={getMenuAnchor}
          open={getMenuAnchor !== null}
          onClose={() => setDisplayNoNotifications(false)}
        >
          <NoNotificationsMessage
            res={props.res}
            onClose={() => setDisplayNoNotifications(false)}
          ></NoNotificationsMessage>
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
  res: getAppStrings(state, 'main-appbar'),
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
