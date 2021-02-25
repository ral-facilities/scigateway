import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import {
  Theme,
  StyleRules,
  createStyles,
  WithStyles,
  withStyles,
  Paper,
  TextareaAutosize,
  FormControlLabel,
  Checkbox,
  Button,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { StateType } from '../state/state.types';
import {
  AppStrings,
  ScheduledMaintenanceState,
} from '../state/scigateway.types';
import { getString, getAppStrings } from '../state/strings';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { setScheduledMaintenanceState } from '../state/actions/scigateway.actions';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      padding: theme.spacing(2),
    },
    titleText: {
      color: theme.palette.secondary.main,
      fontWeight: 'bold',
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      padding: theme.spacing(2),
      [theme.breakpoints.up(800 + theme.spacing(4))]: {
        width: 800,
        marginLeft: 'auto',
        marginRight: 'auto',
      },
    },
    form: {
      flexDirection: 'column',
    },
    textArea: {
      backgroundColor: 'inherit',
      color: theme.palette.text.primary,
      font: 'inherit',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      minWidth: '40%',
      maxWidth: '100%',
    },
  });

interface AdminPageProps {
  scheduledMaintenance: ScheduledMaintenanceState;
  res: AppStrings | undefined;
}

interface AdminPageDispatchProps {
  setScheduledMaintenanceState: (
    scheduledMaintenanceState: ScheduledMaintenanceState
  ) => Promise<void>;
}

export type CombinedAdminPageProps = AdminPageProps &
  AdminPageDispatchProps &
  WithStyles<typeof styles>;

const AdminPage = (props: CombinedAdminPageProps): React.ReactElement => {
  const [scheduledMaintenance, setScheduledMaintenance] = useState<
    ScheduledMaintenanceState
  >(props.scheduledMaintenance);

  return (
    <div className={props.classes.root}>
      <Typography variant="h3" className={props.classes.titleText}>
        {getString(props.res, 'title')}
      </Typography>
      <Paper className={props.classes.paper}>
        <Typography variant="h4">
          {getString(props.res, 'scheduled-maintenance-title')}
        </Typography>
        <TextareaAutosize
          className={props.classes.textArea}
          aria-label={getString(
            props.res,
            'shceduled-maintenance-message-arialabel'
          )}
          rows={7}
          placeholder={getString(props.res, 'message-placeholder')}
          value={scheduledMaintenance.message}
          onChange={(e) =>
            setScheduledMaintenance({
              ...scheduledMaintenance,
              message: e.currentTarget.value,
            })
          }
        />
        <div style={{ display: 'row' }}>
          <FormControlLabel
            style={{ float: 'left' }}
            value={scheduledMaintenance.show}
            control={
              <Checkbox
                checked={scheduledMaintenance.show}
                onChange={(e) =>
                  setScheduledMaintenance({
                    ...scheduledMaintenance,
                    show: e.target.checked,
                  })
                }
                inputProps={{
                  'aria-label': getString(
                    props.res,
                    'scheduled-maintenance-checkbox-arialabel'
                  ),
                }}
                color="secondary"
              />
            }
            label={getString(props.res, 'display-checkbox')}
            labelPlacement="end"
          />
          <Button
            style={{ float: 'right' }}
            variant="contained"
            color="primary"
            onClick={() => {
              props.setScheduledMaintenanceState(scheduledMaintenance);
            }}
          >
            <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
              {getString(props.res, 'save-button')}
            </Typography>
          </Button>
        </div>
      </Paper>
    </div>
  );
};

const mapStateToProps = (state: StateType): AdminPageProps => ({
  scheduledMaintenance: state.scigateway.scheduledMaintenance,
  res: getAppStrings(state, 'admin'),
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): AdminPageDispatchProps => ({
  setScheduledMaintenanceState: (scheduledMaintenanceState) =>
    dispatch(setScheduledMaintenanceState(scheduledMaintenanceState)),
});

export const AdminPageWithoutStyles = AdminPage;
export const AdminPageWithStyles = withStyles(styles)(AdminPage);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminPageWithStyles);
