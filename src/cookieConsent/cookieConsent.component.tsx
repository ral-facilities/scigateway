import React from 'react';
import {
  Theme,
  createStyles,
  StyleRules,
  WithStyles,
  withStyles,
} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import { UKRITheme } from '../theming';
import Cookies from 'js-cookie';
import { initialiseAnalytics } from '../state/actions/scigateway.actions';
import ReactGA from 'react-ga';
import { Action } from 'redux';
import { AnalyticsState, StateType } from '../state/state.types';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { getAppStrings, getString } from '../state/strings';
import { AppStrings } from '../state/scigateway.types';
import { push } from 'connected-react-router';
import { Location } from 'history';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      color: '#FFFFFF',
      backgroundColor: (theme as UKRITheme).colours.darkGreen,
    },
    acceptButton: {
      color: theme.palette.primary.contrastText,
      margin: theme.spacing(1),
    },
    managePreferencesButton: {
      color: '#FFFFFF',
      margin: theme.spacing(1),
    },
  });

interface CookieConsentStateProps {
  analytics?: AnalyticsState;
  res: AppStrings | undefined;
  location: Location;
  loading: boolean;
}

interface CookieConsentDispatchProps {
  initialiseAnalytics: () => Action;
  navigateToCookies: () => Action;
}

export type CombinedCookieConsentProps = CookieConsentStateProps &
  CookieConsentDispatchProps &
  WithStyles<typeof styles>;

const CookieConsent = (
  props: CombinedCookieConsentProps
): React.ReactElement => {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const consentCookie = JSON.parse(Cookies.get('cookie-consent') ?? 'null');
    if (
      props.analytics &&
      !props.analytics.initialised &&
      consentCookie &&
      consentCookie.analytics
    ) {
      ReactGA.initialize(props.analytics.id, {
        titleCase: false,
        gaOptions: {
          cookieExpires: 60 * 60 * 24 * 365, // one year
          cookieFlags: 'Samesite=None;Secure',
        },
      });
      const page = `${props.location.pathname}${props.location.search}`;
      ReactGA.set({
        anonymizeIp: true,
        page,
      });
      // need to send initial pageview
      ReactGA.pageview(page);
      props.initialiseAnalytics();
    }

    if (
      props.loading ||
      JSON.parse(Cookies.get('cookie-consent') ?? 'null') ||
      props.location.pathname === '/cookies'
    ) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [props]);

  const handleAccept = (
    event: React.SyntheticEvent | React.MouseEvent
  ): void => {
    Cookies.set('cookie-consent', JSON.stringify({ analytics: true }), {
      expires: 365,
      sameSite: 'None',
      secure: true,
    });
    setOpen(false);
  };

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      ContentProps={{ className: props.classes.root }}
      open={open}
      message={<div>{getString(props.res, 'text')}</div>}
      action={[
        <Button
          key="decline"
          variant="outlined"
          className={props.classes.managePreferencesButton}
          size="small"
          onClick={props.navigateToCookies}
        >
          {getString(props.res, 'manage-preferences-button')}
        </Button>,
        <Button
          key="accept"
          variant="contained"
          color="primary"
          className={props.classes.acceptButton}
          size="small"
          onClick={handleAccept}
        >
          {getString(props.res, 'accept-button')}
        </Button>,
      ]}
    />
  );
};

const mapStateToProps = (state: StateType): CookieConsentStateProps => ({
  analytics: state.scigateway.analytics,
  res: getAppStrings(state, 'cookie-consent'),
  location: state.router.location,
  loading: state.scigateway.siteLoading,
});

const mapDispatchToProps = (
  dispatch: Dispatch
): CookieConsentDispatchProps => ({
  initialiseAnalytics: () => dispatch(initialiseAnalytics()),
  navigateToCookies: () => dispatch(push('/cookies')),
});

export const CookieConsentWithoutStyles = CookieConsent;
export const CookieConsentWithStyles = withStyles(styles)(CookieConsent);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CookieConsentWithStyles);
