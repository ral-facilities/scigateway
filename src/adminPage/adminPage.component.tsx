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
  MaintenanceState,
  ScheduledMaintenanceState,
} from '../state/scigateway.types';
import { getString, getAppStrings } from '../state/strings';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import {
  setMaintenanceState,
  setScheduledMaintenanceState,
} from '../state/actions/scigateway.actions';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Link } from 'react-router-dom';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
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
      [theme.breakpoints.up(800 + theme.spacing(8))]: {
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
  maintenance: MaintenanceState;
  res: AppStrings | undefined;
}

interface AdminPageDispatchProps {
  setScheduledMaintenanceState: (
    scheduledMaintenanceState: ScheduledMaintenanceState
  ) => Promise<void>;
  setMaintenanceState: (maintenanceState: MaintenanceState) => Promise<void>;
}

export type CombinedAdminPageProps = AdminPageProps &
  AdminPageDispatchProps &
  WithStyles<typeof styles>;

const AdminPage = (props: CombinedAdminPageProps): React.ReactElement => {
  const {
    scheduledMaintenance,
    setScheduledMaintenanceState,
    maintenance,
    setMaintenanceState,
  } = props;

  const [tempScheduledMaintenance, setTempScheduledMaintenance] =
    useState<ScheduledMaintenanceState>(scheduledMaintenance);
  const [tempMaintenance, setTempMaintenance] =
    useState<MaintenanceState>(maintenance);
  const [tabValue, setTabValue] = React.useState<'maintenance' | 'download'>(
    'maintenance'
  );

  // Catch changes to maintenance objects and update local state
  React.useEffect(() => {
    setTempScheduledMaintenance(scheduledMaintenance);
  }, [scheduledMaintenance]);

  React.useEffect(() => {
    setTempMaintenance(maintenance);
  }, [maintenance]);

  return (
    <Paper className={props.classes.root}>
      <Typography variant="h3" className={props.classes.titleText}>
        {getString(props.res, 'title')}
      </Typography>
      <Tabs
        value={tabValue}
        onChange={(event, newValue) => setTabValue(newValue)}
      >
        <Tab
          id="maintenance-tab"
          aria-controls="maintenance-panel"
          label="Maintenance"
          value="maintenance"
        />
        <Tab
          id="download-tab"
          label="Admin Download"
          value="download"
          component={Link}
          to="/admin-download"
        />
      </Tabs>
      <div
        id="maintenance-panel"
        aria-labelledby="maintenance-tab"
        role="tabpanel"
        hidden={tabValue !== 'maintenance'}
      >
        <Paper className={props.classes.paper}>
          <Typography variant="h4">
            {getString(props.res, 'scheduled-maintenance-title')}
          </Typography>
          <TextareaAutosize
            className={props.classes.textArea}
            aria-label={getString(
              props.res,
              'scheduled-maintenance-message-arialabel'
            )}
            rows={7}
            placeholder={getString(props.res, 'message-placeholder')}
            value={tempScheduledMaintenance.message}
            onChange={(e) =>
              setTempScheduledMaintenance({
                ...tempScheduledMaintenance,
                message: e.currentTarget.value,
              })
            }
          />
          <div style={{ display: 'row' }}>
            <FormControlLabel
              style={{ float: 'left' }}
              value={tempScheduledMaintenance.show}
              control={
                <Checkbox
                  checked={tempScheduledMaintenance.show}
                  onChange={(e) =>
                    setTempScheduledMaintenance({
                      ...tempScheduledMaintenance,
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
              onClick={() =>
                setScheduledMaintenanceState(tempScheduledMaintenance)
              }
            >
              <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
                {getString(props.res, 'save-button')}
              </Typography>
            </Button>
          </div>
        </Paper>
        <Paper className={props.classes.paper}>
          <Typography variant="h4">
            {getString(props.res, 'maintenance-title')}
          </Typography>
          <TextareaAutosize
            className={props.classes.textArea}
            aria-label={getString(props.res, 'maintenance-message-arialabel')}
            rows={7}
            placeholder={getString(props.res, 'message-placeholder')}
            value={tempMaintenance.message}
            onChange={(e) =>
              setTempMaintenance({
                ...tempMaintenance,
                message: e.currentTarget.value,
              })
            }
          />
          <div style={{ display: 'row' }}>
            <FormControlLabel
              style={{ float: 'left' }}
              value={tempMaintenance.show}
              control={
                <Checkbox
                  checked={tempMaintenance.show}
                  onChange={(e) =>
                    setTempMaintenance({
                      ...tempMaintenance,
                      show: e.target.checked,
                    })
                  }
                  inputProps={{
                    'aria-label': getString(
                      props.res,
                      'maintenance-checkbox-arialabel'
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
              onClick={() => setMaintenanceState(tempMaintenance)}
            >
              <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
                {getString(props.res, 'save-button')}
              </Typography>
            </Button>
          </div>
        </Paper>
      </div>
    </Paper>
  );
};

const mapStateToProps = (state: StateType): AdminPageProps => ({
  scheduledMaintenance: state.scigateway.scheduledMaintenance,
  maintenance: state.scigateway.maintenance,
  res: getAppStrings(state, 'admin'),
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): AdminPageDispatchProps => ({
  setScheduledMaintenanceState: (scheduledMaintenanceState) =>
    dispatch(setScheduledMaintenanceState(scheduledMaintenanceState)),
  setMaintenanceState: (maintenanceState) =>
    dispatch(setMaintenanceState(maintenanceState)),
});

export const AdminPageWithoutStyles = AdminPage;
export const AdminPageWithStyles = withStyles(styles)(AdminPage);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminPageWithStyles);
