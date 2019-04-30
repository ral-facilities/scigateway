import React from 'react';
import {
  withStyles,
  IconButton,
  WithStyles,
  Typography,
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Clear';
import TickIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/ErrorOutline';
import ErrorIcon from '@material-ui/icons/HighlightOff';
import { Action } from 'redux';

const styles = (): StyleRules => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    marginLeft: 5,
  },
  deleteIcon: {
    height: 15,
    width: 15,
  },
  severityIcon: {
    marginLeft: 5,
    marginRight: 5,
    height: 20,
    width: 20,
  },
});

interface NotificationProps {
  message: string;
  severity: string;
  index: number;
}

interface NotificationDispatchProps {
  dismissNotification: () => Action;
}

type CombinedNotificationProps = NotificationProps &
  NotificationDispatchProps &
  WithStyles<typeof styles>;

const DaaasNotification = (
  props: CombinedNotificationProps
): React.ReactElement => {
  return (
    <div className={props.classes.root}>
      {props.severity === 'success' ? (
        <TickIcon className={props.classes.severityIcon} />
      ) : null}
      {props.severity === 'warning' ? (
        <WarningIcon className={props.classes.severityIcon} />
      ) : null}
      {props.severity === 'error' ? (
        <ErrorIcon className={props.classes.severityIcon} />
      ) : null}
      <Typography variant="body2">{props.message}</Typography>
      <IconButton
        className={props.classes.button}
        onClick={props.dismissNotification}
      >
        <DeleteIcon className={props.classes.deleteIcon} />
      </IconButton>
    </div>
  );
};

export const NotificationWithStyles = withStyles(styles)(DaaasNotification);
