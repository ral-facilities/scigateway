import React from 'react';
import Typography from '@material-ui/core/Typography';

const styles = {
  container: {
    padding: 15,
  },
};

const HomePage = (): React.ReactElement => (
  <div>
    <Typography variant="body1">DAaaS</Typography>
    <Typography variant="body1" style={styles.container}>
      This is the DAaaS landing page
    </Typography>
  </div>
);

export default HomePage;
