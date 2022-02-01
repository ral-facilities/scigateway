import React from 'react';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import { connect } from 'react-redux';
import { StateType } from '../state/state.types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      backgroundColor: theme.palette.background.default,
      textAlign: 'center',
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      color: theme.palette.text.primary,
    },
    titleText: {
      fontWeight: 'bold',
      color: theme.palette.secondary.main,
    },
  })
);

interface MaintenancePageProps {
  message: string;
}

const MaintenancePage = (props: MaintenancePageProps): React.ReactElement => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography variant="h3" className={classes.titleText}>
        Maintenance
      </Typography>
      <div className={classes.container}>
        <Typography variant="h4">{props.message}</Typography>
      </div>
    </div>
  );
};

const mapStateToProps = (state: StateType): MaintenancePageProps => ({
  message: state.scigateway.maintenance.message,
});

export default connect(mapStateToProps)(MaintenancePage);
