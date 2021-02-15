import React from 'react';
import Typography from '@material-ui/core/Typography';
import { WithStyles, withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { StateType } from '../state/state.types';

interface MaintenancePageProps {
  message: string;
}

export type CombinedMaintenancePageProps = MaintenancePageProps &
  WithStyles<typeof styles>;

const MaintenancePage = (
  props: CombinedMaintenancePageProps
): React.ReactElement => {
  return (
    <div className={props.classes.root}>
      <Typography variant="h3" className={props.classes.titleText}>
        Maintenance
      </Typography>
      <div className={props.classes.container}>
        <Typography variant="h4">{props.message}</Typography>
      </div>
    </div>
  );
};

const mapStateToProps = (state: StateType): MaintenancePageProps => ({
  message: state.scigateway.maintenance.message,
});

export const MaintenancePageWithoutStyles = MaintenancePage;
export const MaintenancePageWithStyles = withStyles(styles)(MaintenancePage);

export default connect(mapStateToProps)(MaintenancePageWithStyles);
