import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';

const styles = {
  container: {
    padding: 15,
  },
};

const PageNotFound = (): React.ReactElement => (
  <Typography variant="body1" style={styles.container}>
    Page not found. Please check the page address for typos. Click{' '}
    <Link to="/">here</Link> to return to the home page.
  </Typography>
);

export default PageNotFound;
