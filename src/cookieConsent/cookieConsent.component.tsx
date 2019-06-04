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

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      backgroundColor: (theme as UKRITheme).ukri.purple,
    },
    button: {
      color: theme.palette.primary.contrastText,
      margin: theme.spacing.unit,
    },
  });

interface CookieConsentStateProps {
  analytics?: AnalyticsState;
  res: AppStrings | undefined;
}

interface CookieConsentDispatchProps {
  initialiseAnalytics: () => Action;
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
  const [open, setOpen] = React.useState(true);

  if (open && Cookies.get('cookie-consent')) {
    setOpen(false);
  }

  React.useEffect(() => {
    if (
      props.analytics &&
      !props.analytics.initialised &&
      Cookies.get('cookie-consent') === 'true'
    ) {
      ReactGA.initialize(props.analytics.id, { titleCase: false });
      ReactGA.set({ anonymizeIp: true });
      props.initialiseAnalytics();
    }
  });

  const handleDecline = (
    event: React.SyntheticEvent | React.MouseEvent
  ): void => {
    Cookies.set('cookie-consent', 'false', {
      expires: props.daysCookieValidFor,
    });
    setOpen(false);
  };

  const handleAccept = (
    event: React.SyntheticEvent | React.MouseEvent
  ): void => {
    Cookies.set('cookie-consent', 'true', {
      expires: props.daysCookieValidFor,
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
          className={props.classes.button}
          size="small"
          onClick={handleDecline}
        >
          {getString(props.res, 'decline-button')}
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
});

const mapDispatchToProps = (
  dispatch: Dispatch
): CookieConsentDispatchProps => ({
  initialiseAnalytics: () => dispatch(initialiseAnalytics()),
});

export const CookieConsentWithStyles = withStyles(styles)(CookieConsent);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CookieConsentWithStyles);
