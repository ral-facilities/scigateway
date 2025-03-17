import {
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Paper,
  Select,
  styled,
  TextareaAutosize,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  setMaintenanceState,
  setScheduledMaintenanceState,
} from '../state/actions/scigateway.actions';
import {
  MaintenanceState,
  ScheduledMaintenanceState,
} from '../state/scigateway.types';
import { StateType } from '../state/state.types';

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  [theme.breakpoints.up(800 + parseInt(theme.spacing(8).replace('px', '')))]: {
    width: 800,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}));

const StyledTextArea = styled(TextareaAutosize)(({ theme }) => ({
  backgroundColor: 'inherit',
  color: theme.palette.text.primary,
  font: 'inherit',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  minWidth: '40%',
  maxWidth: '100%',
}));

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
  MaintenancePageDispatchProps;

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
    <div id="maintenance-page">
      <StyledPaper>
        <Typography variant="h4">
          {t('admin.scheduled-maintenance-title')}
        </Typography>
        <StyledTextArea
          aria-label={t('admin.scheduled-maintenance-message-arialabel')}
          minRows={7}
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
            sx={{ float: 'left' }}
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
            label={t('admin.display-checkbox') as string}
            labelPlacement="end"
          />
          <Select
            sx={{
              float: 'left',
              marginLeft: '10px',
              paddingTop: '5px',
              minWidth: '120px',
            }}
            value={tempScheduledMaintenance.severity ?? ''}
            onChange={(e) =>
              setTempScheduledMaintenance({
                ...tempScheduledMaintenance,
                severity: e.target.value as
                  | 'success'
                  | 'warning'
                  | 'error'
                  | 'info',
              })
            }
            inputProps={{ 'aria-label': t('admin.severity-select-arialabel') }}
            variant="standard"
          >
            <MenuItem value="warning">Warning</MenuItem>
            <MenuItem value="info">Information</MenuItem>
          </Select>
          <Button
            sx={{ float: 'right' }}
            variant="contained"
            color="primary"
            onClick={() =>
              setScheduledMaintenanceState(tempScheduledMaintenance)
            }
          >
            <Typography color="inherit" noWrap sx={{ marginTop: '3px' }}>
              {t('admin.save-button')}
            </Typography>
          </Button>
        </div>
      </StyledPaper>
      <StyledPaper>
        <Typography variant="h4">{t('admin.maintenance-title')}</Typography>
        <StyledTextArea
          aria-label={t('admin.maintenance-message-arialabel')}
          minRows={7}
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
            sx={{ float: 'left' }}
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
            label={t('admin.display-checkbox') as string}
            labelPlacement="end"
          />
          <Button
            sx={{ float: 'right' }}
            variant="contained"
            color="primary"
            onClick={() => setMaintenanceState(tempMaintenance)}
          >
            <Typography color="inherit" noWrap sx={{ marginTop: '3px' }}>
              {t('admin.save-button')}
            </Typography>
          </Button>
        </div>
      </StyledPaper>
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

export default connect(mapStateToProps, mapDispatchToProps)(MaintenancePage);
