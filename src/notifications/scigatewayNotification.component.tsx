import React from 'react';
import { Theme, IconButton, Typography } from '@mui/material';
import { WithStyles, StyleRules } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import DeleteIcon from '@mui/icons-material/Clear';
import TickIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/ErrorOutline';
import ErrorIcon from '@mui/icons-material/HighlightOff';
import { Action } from 'redux';
import { UKRITheme } from '../theming';

const severityIconStyle = {
  marginLeft: 5,
  marginRight: 5,
  height: 20,
  width: 20,
};

const styles = (theme: Theme): StyleRules => ({
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
  successIcon: {
    ...severityIconStyle,
    color: 'green',
  },
  warningIcon: {
    ...severityIconStyle,
    color: (theme as UKRITheme).colours.lightOrange,
  },
  errorIcon: {
    ...severityIconStyle,
    color: 'red',
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

export type CombinedNotificationProps = NotificationProps &
  NotificationDispatchProps &
  WithStyles<typeof styles>;

const ForwardRefScigatewayNotification = React.forwardRef(
  function ScigatewayNotification(
    props: CombinedNotificationProps,
    ref: React.Ref<HTMLDivElement>
  ): React.ReactElement {
    return (
      <div ref={ref} className={props.classes.root}>
        {props.severity === 'success' ? (
          <TickIcon className={props.classes.successIcon} />
        ) : null}
        {props.severity === 'warning' ? (
          <WarningIcon className={props.classes.warningIcon} />
        ) : null}
        {props.severity === 'error' ? (
          <ErrorIcon className={props.classes.errorIcon} />
        ) : null}
        <Typography variant="body2">{props.message}</Typography>
        <IconButton
          className={props.classes.button}
          onClick={props.dismissNotification}
          aria-label="Dismiss notification"
          size="large"
        >
          <DeleteIcon className={props.classes.deleteIcon} />
        </IconButton>
      </div>
    );
  }
);

export const NotificationWithoutStyles = ForwardRefScigatewayNotification;
export const NotificationWithStyles = withStyles(styles)(
  ForwardRefScigatewayNotification
);
