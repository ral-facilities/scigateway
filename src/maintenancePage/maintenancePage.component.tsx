import React from 'react';
import Typography from '@mui/material/Typography';
import { connect } from 'react-redux';
import { StateType } from '../state/state.types';
import { Box } from '@mui/material';

interface MaintenancePageProps {
  message: string;
}

const MaintenancePage = (props: MaintenancePageProps): React.ReactElement => {
  return (
    <Box
      sx={{
        padding: 2,
        backgroundColor: 'background.default',
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h3"
        sx={{ fontWeight: 'bold', color: 'secondary.main' }}
      >
        Maintenance
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: 2,
          marginBottom: 2,
          color: 'text.primary',
        }}
      >
        <Typography variant="h4">{props.message}</Typography>
      </Box>
    </Box>
  );
};

const mapStateToProps = (state: StateType): MaintenancePageProps => ({
  message: state.scigateway.maintenance.message,
});

export default connect(mapStateToProps)(MaintenancePage);
