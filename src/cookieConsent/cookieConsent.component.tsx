import React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
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

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  margin: theme.spacing(1),
}));

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
  CookieConsentDispatchProps;

export const CookieConsent = (
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
          cookieExpires: 60 * 60 * 24 * 365, // one year
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
      Cookies.getJSON('cookie-consent') ||
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
    Cookies.set(
      'cookie-consent',
      { analytics: true },
      {
        expires: 365,
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
      ContentProps={{
        sx: {
          color: 'primary.contrastText',
          backgroundColor: (theme) => (theme as UKRITheme).colours.darkGreen,
        },
      }}
      open={open}
      message={<div>{getString(props.res, 'text')}</div>}
      action={[
        <StyledButton
          key="decline"
          variant="outlined"
          size="small"
          onClick={props.navigateToCookies}
        >
          {getString(props.res, 'manage-preferences-button')}
        </StyledButton>,
        <StyledButton
          key="accept"
          variant="contained"
          color="primary"
          size="small"
          onClick={handleAccept}
        >
          {getString(props.res, 'accept-button')}
        </StyledButton>,
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

export const UnconnectedCookieConsent = CookieConsent;

export default connect(mapStateToProps, mapDispatchToProps)(CookieConsent);
