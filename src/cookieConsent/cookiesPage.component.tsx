import React from 'react';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {
  StyleRules,
  withStyles,
  Theme,
  WithStyles,
  createStyles,
} from '@material-ui/core/styles';
import { getAppStrings, getString } from '../state/strings';
import { connect } from 'react-redux';
import { StateType } from '../state/state.types';
import { AppStrings } from '../state/scigateway.types';
import Cookies from 'js-cookie';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      margin: 2 * theme.spacing.unit,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: 2 * theme.spacing.unit,
      marginBottom: 2 * theme.spacing.unit,
    },
    titleText: {
      fontWeight: 'bold',
      color: theme.palette.primary.main,
    },
    cookiePolicy: {
      marginTop: 2 * theme.spacing.unit,
      marginBottom: 2 * theme.spacing.unit,
    },
    cookieTypes: {
      marginTop: 2 * theme.spacing.unit,
      marginBottom: 2 * theme.spacing.unit,
    },
    button: {
      color: theme.palette.primary.contrastText,
    },
    cookieList: {
      paddingLeft: 2 * theme.spacing.unit,
    },
    cookieListItem: {
      display: 'list-item',
    },
  });

interface CookiesPageProps {
  res: AppStrings | undefined;
}

type CombinedCookiesPageProps = CookiesPageProps & WithStyles<typeof styles>;

const handleSavePreferences = ({ analytics }: { analytics: boolean }): void => {
  if (!analytics) {
    Cookies.remove('_ga');
    Cookies.remove('_gid');
  }

  Cookies.set(
    'cookie-consent',
    { analytics },
    {
      expires: 365,
    }
  );
  window.location.reload();
};

const CookiesPage = (props: CombinedCookiesPageProps): React.ReactElement => {
  const cookieConsent = Cookies.getJSON('cookie-consent');
  const [analytics, setAnalytics] = React.useState(
    cookieConsent ? cookieConsent.analytics : false
  );

  return (
    <div className={props.classes.root}>
      <Typography variant="h3" className={props.classes.titleText}>
        {getString(props.res, 'title')}
      </Typography>
      <div className={props.classes.container}>
        <Typography variant="h4">
          {getString(props.res, 'cookie-policy-title')}
        </Typography>
        <Typography
          variant="body1"
          className={props.classes.cookiePolicy}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'cookie-policy'),
          }}
        />
      </div>
      <div className={props.classes.container}>
        <Typography variant="h4">
          {getString(props.res, 'cookie-management-title')}
        </Typography>
        <Grid
          container
          spacing={8}
          direction="column"
          className={props.classes.cookieTypes}
        >
          <Grid container item alignItems="center" justify="flex-start">
            <Grid item xs={2} sm={1}>
              <Switch
                disabled
                color="primary"
                checked={true}
                inputProps={{
                  'aria-labelledby': 'essential-cookies-title',
                  'aria-describedby': 'essential-cookies-description',
                }}
              />
            </Grid>
            <Grid item xs={4} sm={2}>
              <Typography variant="body1" id="essential-cookies-title">
                {getString(props.res, 'essential-cookies-title')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={9} id="essential-cookies-description">
              <Typography variant="body1">
                {getString(props.res, 'essential-cookies-description')}
              </Typography>
              <ul className={props.classes.cookieList}>
                <Typography
                  variant="body1"
                  component="li"
                  className={props.classes.cookieListItem}
                >
                  {getString(props.res, 'cookie-consent-description')}
                </Typography>
                <Typography
                  variant="body1"
                  component="li"
                  className={props.classes.cookieListItem}
                >
                  {getString(props.res, 'daaas-token-description')}
                </Typography>
              </ul>
            </Grid>
          </Grid>
          <Grid container item alignItems="center" justify="flex-start">
            <Grid item xs={2} sm={1}>
              <Switch
                checked={analytics}
                color="primary"
                onChange={e => setAnalytics(e.target.checked)}
                inputProps={{
                  'aria-labelledby': 'analytics-cookies-title',
                  'aria-describedby': 'analytics-cookies-description',
                }}
              />
            </Grid>
            <Grid item xs={4} sm={2}>
              <Typography variant="body1" id="analytics-cookies-title">
                {getString(props.res, 'analytics-cookies-title')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={9} id="analytics-cookies-description">
              <Typography variant="body1">
                {getString(props.res, 'analytics-cookies-description')}
              </Typography>
              <ul className={props.classes.cookieList}>
                <Typography
                  variant="body1"
                  component="li"
                  className={props.classes.cookieListItem}
                >
                  {getString(props.res, 'google-analytics-description')}
                </Typography>
              </ul>
            </Grid>
          </Grid>
        </Grid>
      </div>
      <Button
        variant="contained"
        color="primary"
        size="medium"
        className={props.classes.button}
        onClick={() => handleSavePreferences({ analytics })}
      >
        {getString(props.res, 'save-preferences-button')}
      </Button>
    </div>
  );
};

const mapStateToProps = (state: StateType): CookiesPageProps => ({
  res: getAppStrings(state, 'cookies-page'),
});

export const CookiesPageWithStyles = withStyles(styles)(CookiesPage);

export default connect(mapStateToProps)(CookiesPageWithStyles);
