import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { withStyles, WithStyles, Theme } from '@material-ui/core';
import BugReportIcon from '@material-ui/icons/BugReport';
import { StyleRules } from '@material-ui/core/styles';
import { UKRITheme } from '../theming';

const styles = (theme: Theme): StyleRules => ({
  titleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
  },
  bugIcon: {
    width: '10vw',
    height: '10vw',
    color: (theme as UKRITheme).ukri.text.blue,
  },
  codeText: {
    fontWeight: 'bold',
    fontSize: '10vw',
    color: (theme as UKRITheme).ukri.text.blue,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
  },
  bold: {
    color: theme.palette.text.primary,
  },
  message: {
    padding: 15,
    maxWidth: 600,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
});

const PageNotFound = (props: WithStyles<typeof styles>): React.ReactElement => (
  <div>
    <div className={props.classes.titleContainer}>
      <BugReportIcon className={props.classes.bugIcon} />
      <Typography className={props.classes.codeText}>404</Typography>
    </div>
    <div className={props.classes.container}>
      <Typography variant="h2" className={props.classes.bold}>
        Page not found
      </Typography>
      <Typography variant="body1" className={props.classes.message}>
        We&apos;re sorry, the page you requested could not be found. Please
        check the page address for typos. Click{' '}
        <Link className={props.classes.bold} to="/">
          here
        </Link>{' '}
        to return to the home page or contact support.
      </Typography>
    </div>
  </div>
);

export default withStyles(styles)(PageNotFound);
