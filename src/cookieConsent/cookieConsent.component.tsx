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

interface CookieConsentProps {
  analytics?: AnalyticsState;
}

interface CookieConsentDispatchProps {
  initialiseAnalytics: () => Action;
}

const CookieConsent = (
  props: CookieConsentProps &
    CookieConsentDispatchProps &
    WithStyles<typeof styles>
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
    Cookies.set('cookie-consent', 'false', { expires: 1 / 1440 });
    setOpen(false);
  };

  const handleAccept = (
    event: React.SyntheticEvent | React.MouseEvent
  ): void => {
    Cookies.set('cookie-consent', 'true', { expires: 1 / 1440 });
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
      message={<span>Cookie message</span>}
      action={[
        <Button
          key="decline"
          variant="outlined"
          className={props.classes.button}
          size="small"
          onClick={handleDecline}
        >
          Decline
        </Button>,
        <Button
          key="accept"
          variant="contained"
          color="primary"
          className={props.classes.button}
          size="small"
          onClick={handleAccept}
        >
          Accept
        </Button>,
      ]}
    />
  );
};

const mapStateToProps = (state: StateType): CookieConsentProps => ({
  analytics: state.daaas.analytics,
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
