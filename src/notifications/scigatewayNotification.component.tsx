import React from 'react';
import { Theme, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Clear';
import TickIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/ErrorOutline';
import ErrorIcon from '@mui/icons-material/HighlightOff';
import { Action } from 'redux';

const severityIconStyle = {
  marginLeft: '5px',
  marginRight: '5px',
  height: '20px',
  width: '20px',
};

interface NotificationProps {
  message: string;
  severity: string;
  index: number;
}

interface NotificationDispatchProps {
  dismissNotification: () => Action;
}

export type CombinedNotificationProps = NotificationProps &
  NotificationDispatchProps;

const ScigatewayNotification = React.forwardRef(function ScigatewayNotification(
  props: CombinedNotificationProps,
  ref: React.Ref<HTMLDivElement>
): React.ReactElement {
  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'center' }}>
      {props.severity === 'success' ? (
        <TickIcon sx={{ ...severityIconStyle, color: 'green' }} />
      ) : null}
      {props.severity === 'warning' ? (
        <WarningIcon
          sx={{
            ...severityIconStyle,
            color: (theme: Theme) => theme.colours.lightOrange,
          }}
        />
      ) : null}
      {props.severity === 'error' ? (
        <ErrorIcon sx={{ ...severityIconStyle, color: 'red' }} />
      ) : null}
      <Typography variant="body2" sx={{ marginTop: 0.5 }}>
        {props.message}
      </Typography>
      <IconButton
        sx={{ marginLeft: '5px', marginTop: '2px' }}
        onClick={props.dismissNotification}
        aria-label="Dismiss notification"
        size="large"
      >
        <DeleteIcon sx={{ height: '15px', width: '15px' }} />
      </IconButton>
    </div>
  );
});

export default ScigatewayNotification;
