import React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Cookies from 'js-cookie';
import { initialiseAnalytics } from '../state/actions/scigateway.actions';
import { Action } from 'redux';
import { AnalyticsState, StateType } from '../state/state.types';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { getAppStrings, getString } from '../state/strings';
import { AppStrings } from '../state/scigateway.types';
import { push } from 'connected-react-router';
import { Location } from 'history';

const ManageButton = styled(Button)(({ theme }) => ({
  color: '#FFFFFF',
  margin: theme.spacing(1),
}));

const AcceptButton = styled(Button)(({ theme }) => ({
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
    const consentCookie = JSON.parse(Cookies.get('cookie-consent') ?? 'null');
    if (
      props.analytics &&
      !props.analytics.initialised &&
      consentCookie &&
      consentCookie.analytics
    ) {
      //Global Site Tag (gtag.js) - Google Analytics
      const UrlScript = document.createElement('script');
      UrlScript.async = true;
      UrlScript.src =
        'https://www.googletagmanager.com/gtag/js?id=G-BMV4M8LC8J';

      const gtagScript = document.createElement('script');
      gtagScript.innerText =
        'window.dataLayer = window.dataLayer || [];' +
        'function gtag(){dataLayer.push(arguments);}' +
        "gtag('js', new Date());" +
        "gtag('config', 'G-BMV4M8LC8J');";

      document.head.appendChild(UrlScript);
      document.head.appendChild(gtagScript);
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
      ContentProps={{
        sx: {
          color: 'primary.contrastText',
          backgroundColor: (theme) => theme.colours.darkGreen,
        },
      }}
      open={open}
      message={<div>{getString(props.res, 'text')}</div>}
      action={[
        <ManageButton
          key="decline"
          variant="outlined"
          size="small"
          onClick={props.navigateToCookies}
        >
          {getString(props.res, 'manage-preferences-button')}
        </ManageButton>,
        <AcceptButton
          key="accept"
          variant="contained"
          color="primary"
          size="small"
          onClick={handleAccept}
        >
          {getString(props.res, 'accept-button')}
        </AcceptButton>,
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
