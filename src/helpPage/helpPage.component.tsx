import React from 'react';
import Typography from '@material-ui/core/Typography';
import {
  Theme,
  StyleRules,
  createStyles,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { getAppStrings, getString } from '../state/strings';
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
          color: (theme as UKRITheme).colours.link.default,
        },
        '&:visited': {
          color: (theme as UKRITheme).colours.link.visited,
        },
        '&:active': {
          color: (theme as UKRITheme).colours.link.active,
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

const HelpPage = (props: CombinedHelpPageProps): React.ReactElement => {
  return (
    <div className={props.classes.root}>
      <Typography variant="h3" className={props.classes.titleText}>
        {getString(props.res, 'title')}
      </Typography>
      <div className={props.classes.container}>
        <Typography variant="h4">
          {getString(props.res, 'logging-in-title')}
        </Typography>
        <Typography
          variant="body1"
          className={props.classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'logging-in-description'),
          }}
        />
      </div>
      <div className={props.classes.container}>
        <Typography variant="h4">
          {getString(props.res, 'my-data-title')}
        </Typography>
        <Typography
          variant="body1"
          className={props.classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'my-data-description'),
          }}
        />
      </div>
      <div className={props.classes.container}>
        <Typography variant="h4">
          {getString(props.res, 'browse-title')}
        </Typography>
        <Typography
          variant="body1"
          className={props.classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'browse-description'),
          }}
        />
      </div>
      <div className={props.classes.container}>
        <Typography variant="h4">
          {getString(props.res, 'search-title')}
        </Typography>
        <Typography
          variant="body1"
          className={props.classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'search-description'),
          }}
        />
      </div>
      <div className={props.classes.container}>
        <Typography variant="h4">
          {getString(props.res, 'cart-title')}
        </Typography>
        <Typography
          variant="body1"
          className={props.classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'cart-description'),
          }}
        />
      </div>
      <div className={props.classes.container}>
        <Typography variant="h4">
          {getString(props.res, 'download-title')}
        </Typography>
        <Typography
          variant="body1"
          className={props.classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'download-description'),
          }}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: StateType): HelpPageProps => ({
  res: getAppStrings(state, 'help-page'),
});

export const HelpPageWithoutStyles = HelpPage;
export const HelpPageWithStyles = withStyles(styles)(HelpPage);

export default connect(mapStateToProps)(HelpPageWithStyles);
