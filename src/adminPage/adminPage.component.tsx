import React from 'react';
import { Theme, StyleRules, createStyles, withStyles } from '@material-ui/core';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      padding: theme.spacing(2),
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
      [theme.breakpoints.up(800 + theme.spacing(4))]: {
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

const AdminPage = (): React.ReactElement => {
  return <div></div>;
};

export const AdminPageWithoutStyles = AdminPage;
export const AdminPageWithStyles = withStyles(styles)(AdminPage);
