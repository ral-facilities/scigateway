import React from 'react';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import { getAppStrings, getString } from '../state/strings';
import { connect } from 'react-redux';
import { AppStrings } from '../state/scigateway.types';
import { StateType } from '../state/state.types';
import { UKRITheme } from '../theming';

const useStyles = makeStyles((theme: Theme) =>
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
  })
);

interface HelpPageProps {
  res: AppStrings | undefined;
}

export type CombinedHelpPageProps = HelpPageProps;

export const HelpPage = (props: CombinedHelpPageProps): React.ReactElement => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography variant="h3" className={classes.titleText}>
        {getString(props.res, 'title')}
      </Typography>
      <div className={classes.container}>
        <Typography variant="h4">
          {getString(props.res, 'logging-in-title')}
        </Typography>
        <Typography
          variant="body1"
          className={classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'logging-in-description'),
          }}
        />
      </div>
      <div className={classes.container}>
        <Typography variant="h4">
          {getString(props.res, 'my-data-title')}
        </Typography>
        <Typography
          variant="body1"
          className={classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'my-data-description'),
          }}
        />
      </div>
      <div className={classes.container}>
        <Typography variant="h4">
          {getString(props.res, 'browse-title')}
        </Typography>
        <Typography
          variant="body1"
          className={classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'browse-description'),
          }}
        />
      </div>
      <div className={classes.container}>
        <Typography variant="h4">
          {getString(props.res, 'search-title')}
        </Typography>
        <Typography
          variant="body1"
          className={classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'search-description'),
          }}
        />
      </div>
      <div className={classes.container}>
        <Typography variant="h4">
          {getString(props.res, 'cart-title')}
        </Typography>
        <Typography
          variant="body1"
          className={classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'cart-description'),
          }}
        />
      </div>
      <div className={classes.container}>
        <Typography variant="h4">
          {getString(props.res, 'download-title')}
        </Typography>
        <Typography
          variant="body1"
          className={classes.description}
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

export default connect(mapStateToProps)(HelpPage);
