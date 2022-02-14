import React from 'react';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { getAppStrings, getString } from '../state/strings';
import { connect } from 'react-redux';
import { StateType } from '../state/state.types';
import { AppStrings } from '../state/scigateway.types';
import Cookies from 'js-cookie';
import { Dispatch, Action } from 'redux';
import { push } from 'connected-react-router';

const RootDiv = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  '& a': {
    '&:link': {
      color: theme.colours.link.default,
    },
    '&:visited': {
      color: theme.colours.link.visited,
    },
    '&:active': {
      color: theme.colours.link.active,
    },
  },
}));

const ContainerDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

const CookieList = styled('ul')(({ theme }) => ({
  paddingLeft: theme.spacing(2),
}));

const cookieListItemStyles = {
  display: 'list-item',
};

interface CookiesPageProps {
  res: AppStrings | undefined;
}

interface CookiesPageDispatchProps {
  navigateToHome: () => Action;
}

export type CombinedCookiesPageProps = CookiesPageProps &
  CookiesPageDispatchProps;

const handleSavePreferences = ({ analytics }: { analytics: boolean }): void => {
  if (!analytics) {
    Cookies.remove('_ga');
    Cookies.remove('_gid');
  }

  Cookies.set('cookie-consent', JSON.stringify({ analytics }), {
    expires: 365,
  });
};

const CookiesPage = (props: CombinedCookiesPageProps): React.ReactElement => {
  const cookieConsent = JSON.parse(Cookies.get('cookie-consent') ?? 'null');
  const [analytics, setAnalytics] = React.useState(
    cookieConsent ? cookieConsent.analytics : false
  );

  return (
    <RootDiv>
      <Typography
        variant="h3"
        sx={{ fontWeight: 'bold', color: 'secondary.main' }}
      >
        {getString(props.res, 'title')}
      </Typography>
      <ContainerDiv>
        <Typography variant="h4">
          {getString(props.res, 'cookie-policy-title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{ marginTop: 2, marginBottom: 2 }}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'cookie-policy'),
          }}
        />
      </ContainerDiv>
      <ContainerDiv>
        <Typography variant="h4">
          {getString(props.res, 'cookie-management-title')}
        </Typography>
        <Grid
          container
          spacing={4}
          direction="column"
          sx={{ marginTop: 2, marginBottom: 2 }}
        >
          <Grid container item alignItems="center" justifyContent="flex-start">
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
              <CookieList>
                <Typography
                  variant="body1"
                  component="li"
                  sx={cookieListItemStyles}
                >
                  {getString(props.res, 'cookie-consent-description')}
                </Typography>
                <Typography
                  variant="body1"
                  component="li"
                  sx={cookieListItemStyles}
                >
                  {getString(props.res, 'scigateway-token-description')}
                </Typography>
              </CookieList>
            </Grid>
          </Grid>
          <Grid container item alignItems="center" justifyContent="flex-start">
            <Grid item xs={2} sm={1}>
              <Switch
                checked={analytics}
                color="primary"
                onChange={(e) => setAnalytics(e.target.checked)}
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
              <CookieList>
                <Typography
                  variant="body1"
                  component="li"
                  sx={cookieListItemStyles}
                >
                  {getString(props.res, 'google-analytics-description')}
                </Typography>
              </CookieList>
            </Grid>
          </Grid>
        </Grid>
      </ContainerDiv>
      <Button
        variant="contained"
        color="primary"
        size="medium"
        sx={{ color: 'primary.contrastText' }}
        onClick={() => {
          handleSavePreferences({ analytics });
          props.navigateToHome();
        }}
      >
        {getString(props.res, 'save-preferences-button')}
      </Button>
    </RootDiv>
  );
};

const mapStateToProps = (state: StateType): CookiesPageProps => ({
  res: getAppStrings(state, 'cookies-page'),
});

const mapDispatchToProps = (dispatch: Dispatch): CookiesPageDispatchProps => ({
  navigateToHome: () => dispatch(push('/')),
});

export const UnconnectedCookiesPage = CookiesPage;

export default connect(mapStateToProps, mapDispatchToProps)(CookiesPage);
