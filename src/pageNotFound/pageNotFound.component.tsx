import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { withStyles, WithStyles, Theme } from '@material-ui/core';
import BugReportIcon from '@material-ui/icons/BugReport';
import { StyleRules } from '@material-ui/core/styles';
import { useTranslation, Trans } from 'react-i18next';

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
    color: theme.palette.primary.main,
  },
  codeText: {
    fontWeight: 'bold',
    fontSize: '10vw',
    color: theme.palette.primary.main,
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

const PageNotFound = (props: WithStyles<typeof styles>): React.ReactElement => {
  const [t] = useTranslation();
  return (
    <div>
      <div className={props.classes.titleContainer}>
        <BugReportIcon className={props.classes.bugIcon} />
        <Typography className={props.classes.codeText}>404</Typography>
      </div>
      <div className={props.classes.container}>
        <Typography variant="h2" className={props.classes.bold}>
          {t('page-not-found.title')}
        </Typography>
        <Typography variant="body1" className={props.classes.message}>
          <Trans t={t} i18nKey="page-not-found.message">
            We&#39;re sorry, the page you requested was not found on the server.
            If you entered the URL manually please check your spelling and try
            again. Otherwise, return to the{' '}
            <Link className={props.classes.bold} to="/">
              homepage
            </Link>{' '}
            or{' '}
            <Link className={props.classes.bold} to="/contact">
              contact support
            </Link>
            .
          </Trans>
        </Typography>
      </div>
    </div>
  );
};

export default withStyles(styles)(PageNotFound);
