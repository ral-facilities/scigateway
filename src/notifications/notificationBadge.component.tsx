import React, { useState } from 'react';
import { connect } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Theme, Badge, Menu, Typography } from '@mui/material';
import { StyleRules } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { StateType, ScigatewayNotification } from '../state/state.types';
import { Dispatch, Action } from 'redux';
import { dismissMenuItem } from '../state/actions/scigateway.actions';
import { NotificationWithStyles } from './scigatewayNotification.component';
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1),
      color: theme.palette.primary.contrastText,
    },
    menuItem: {
      display: 'flex',
    },
    message: {
      flexGrow: 1,
    },
  })
);

export type CombinedNotificationBadgeProps = BadgeProps & BadgeDispatchProps;

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
          size="large"
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
  const closeMenu = (): void => {
    setMenuAnchor(null);
    setDisplayNoNotifications(false);
  };

  const classes = useStyles();

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
        className={classes.button}
        onClick={(e) => {
          if (!props.notifications || props.notifications.length === 0)
            setDisplayNoNotifications(true);
          setMenuAnchor(e.currentTarget);
        }}
        aria-label="Open notification menu"
        size="large"
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
      {/* Only display menu if there is something to display */}
      {displayNoNotifications ||
      (props.notifications && props.notifications.length) ? (
        <Menu
          id="notifications-menu"
          anchorEl={getMenuAnchor}
          open={getMenuAnchor !== null}
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

export default connect(mapStateToProps, mapDispatchToProps)(NotificationBadge);
