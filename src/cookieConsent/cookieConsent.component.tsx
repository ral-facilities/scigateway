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
import { initialiseAnalytics } from '../state/actions/daaas.actions';
import ReactGA from 'react-ga';
import { Action } from 'redux';
import { AnalyticsState, StateType } from '../state/state.types';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { getAppStrings, getString } from '../state/strings';
import { AppStrings } from '../state/daaas.types';
import { push } from 'connected-react-router';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      backgroundColor: (theme as UKRITheme).ukri.green,
    },
    button: {
      color: theme.palette.primary.contrastText,
      margin: theme.spacing.unit,
    },
  });

interface CookieConsentStateProps {
  analytics?: AnalyticsState;
  res: AppStrings | undefined;
  location: string;
  loading: boolean;
}

interface CookieConsentDispatchProps {
  initialiseAnalytics: () => Action;
  navigateToCookies: () => Action;
}

interface CookieConsentProps {
  daysCookieValidFor?: number;
}

type CombinedCookieConsentProps = CookieConsentProps &
  CookieConsentStateProps &
  CookieConsentDispatchProps &
  WithStyles<typeof styles>;

const CookieConsent = (
  props: CombinedCookieConsentProps
): React.ReactElement => {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const consentCookie = Cookies.getJSON('cookie-consent');
    if (
      props.analytics &&
      !props.analytics.initialised &&
      consentCookie &&
      consentCookie.analytics
    ) {
      ReactGA.initialize(props.analytics.id, {
        titleCase: false,
        gaOptions: {
          cookieExpires: 60 * 60 * 24 * 365,
        },
      });
      ReactGA.set({ anonymizeIp: true });
      props.initialiseAnalytics();
    }

    if (
      props.loading ||
      Cookies.getJSON('cookie-consent') ||
      props.location === '/cookies'
    ) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [props]);

  const handleAccept = (
    event: React.SyntheticEvent | React.MouseEvent
  ): void => {
    Cookies.set(
      'cookie-consent',
      { analytics: true },
      {
        expires: props.daysCookieValidFor,
      }
    );
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
          className={props.classes.button}
          size="small"
          onClick={props.navigateToCookies}
        >
          {getString(props.res, 'manage-preferences-button')}
        </Button>,
        <Button
          key="accept"
          variant="contained"
          color="primary"
          className={props.classes.button}
          size="small"
          onClick={handleAccept}
        >
          {getString(props.res, 'accept-button')}
        </Button>,
      ]}
    />
  );
};

CookieConsent.defaultProps = { daysCookieValidFor: 365 };

const mapStateToProps = (state: StateType): CookieConsentStateProps => ({
  analytics: state.daaas.analytics,
  res: getAppStrings(state, 'cookie-consent'),
  location: state.router.location.pathname,
  loading: state.daaas.siteLoading,
});

const mapDispatchToProps = (
  dispatch: Dispatch
): CookieConsentDispatchProps => ({
  initialiseAnalytics: () => dispatch(initialiseAnalytics()),
  navigateToCookies: () => dispatch(push('/cookies')),
});

export const CookieConsentWithStyles = withStyles(styles)(CookieConsent);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CookieConsentWithStyles);
