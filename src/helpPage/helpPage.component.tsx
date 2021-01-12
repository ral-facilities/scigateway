import React from 'react';
import {
  Theme,
  StyleRules,
  createStyles,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { getAppStrings } from '../state/strings';
import { connect } from 'react-redux';
import { AppStrings } from '../state/scigateway.types';
import { StateType } from '../state/state.types';
import { UKRITheme } from '../theming';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      backgroundColor: theme.palette.background.default,
      '& a': {
        '&:link': {
          color: (theme as UKRITheme).ukri.bright.blue,
        },
        '&:visited': {
          color: (theme as UKRITheme).ukri.bright.purple,
        },
        '&:active': {
          color: (theme as UKRITheme).ukri.bright.red,
        },
      },
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
    description: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  });

interface HelpPageProps {
  res: AppStrings | undefined;
}

export type CombinedHelpPageProps = HelpPageProps & WithStyles<typeof styles>;

const HelpPage = (): React.ReactElement => {
  return <div></div>;
};

const mapStateToProps = (state: StateType): HelpPageProps => ({
  res: getAppStrings(state, 'help-page'),
});

export const HelpPageWithoutStyles = HelpPage;
export const HelpPageWithStyles = withStyles(styles)(HelpPage);

export default connect(mapStateToProps)(HelpPageWithStyles);
