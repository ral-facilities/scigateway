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
import {
  MaintenanceState,
  ScheduledMaintenanceState,
} from '../state/scigateway.types';
import {
  setMaintenanceState,
  setScheduledMaintenanceState,
} from '../state/actions/scigateway.actions';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { StateType } from '../state/state.types';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';

const styles = (theme: Theme): StyleRules =>
  createStyles({
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

export interface MaintenancePageProps {
  scheduledMaintenance: ScheduledMaintenanceState;
  maintenance: MaintenanceState;
}

export interface MaintenancePageDispatchProps {
  setScheduledMaintenanceState: (
    scheduledMaintenanceState: ScheduledMaintenanceState
  ) => Promise<void>;
  setMaintenanceState: (maintenanceState: MaintenanceState) => Promise<void>;
}

export type CombinedMaintenancePageProps = MaintenancePageProps &
  MaintenancePageDispatchProps &
  WithStyles<typeof styles>;

export const MaintenancePage = (
  props: CombinedMaintenancePageProps
): ReactElement => {
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

  // Catch changes to maintenance objects and update local state
  React.useEffect(() => {
    setTempScheduledMaintenance(scheduledMaintenance);
  }, [scheduledMaintenance]);

  React.useEffect(() => {
    setTempMaintenance(maintenance);
  }, [maintenance]);
  const [t] = useTranslation();

  return (
    <div>
      <Paper className={props.classes.paper}>
        <Typography variant="h4">
          {t('admin.scheduled-maintenance-title')}
        </Typography>
        <TextareaAutosize
          className={props.classes.textArea}
          aria-label={t('admin.scheduled-maintenance-message-arialabel')}
          rows={7}
          placeholder={t('admin.message-placeholder')}
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
                  'aria-label': t(
                    'admin.scheduled-maintenance-checkbox-arialabel'
                  ),
                }}
                color="secondary"
              />
            }
            label={t('admin.display-checkbox')}
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
              {t('admin.save-button')}
            </Typography>
          </Button>
        </div>
      </Paper>
      <Paper className={props.classes.paper}>
        <Typography variant="h4">{t('admin.maintenance-title')}</Typography>
        <TextareaAutosize
          className={props.classes.textArea}
          aria-label={t('admin.maintenance-message-arialabel')}
          rows={7}
          placeholder={t('admin.message-placeholder')}
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
                  'aria-label': t('admin.maintenance-checkbox-arialabel'),
                }}
                color="secondary"
              />
            }
            label={t('admin.display-checkbox')}
            labelPlacement="end"
          />
          <Button
            style={{ float: 'right' }}
            variant="contained"
            color="primary"
            onClick={() => setMaintenanceState(tempMaintenance)}
          >
            <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
              {t('admin.save-button')}
            </Typography>
          </Button>
        </div>
      </Paper>
    </div>
  );
};

const mapStateToProps = (state: StateType): MaintenancePageProps => ({
  scheduledMaintenance: state.scigateway.scheduledMaintenance,
  maintenance: state.scigateway.maintenance,
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): MaintenancePageDispatchProps => ({
  setScheduledMaintenanceState: (scheduledMaintenanceState) =>
    dispatch(setScheduledMaintenanceState(scheduledMaintenanceState)),
  setMaintenanceState: (maintenanceState) =>
    dispatch(setMaintenanceState(maintenanceState)),
});
export const MaintenancePageWithStyles = withStyles(styles)(MaintenancePage);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MaintenancePageWithStyles);
