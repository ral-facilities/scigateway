import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Box,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  styled,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  resetAuthState,
  verifyUsernameAndPassword,
} from '../state/actions/scigateway.actions';
import { AppStrings } from '../state/scigateway.types';
import { Authenticator, AuthState, StateType } from '../state/state.types';

const RootDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: 'auto',
  marginLeft: theme.spacing(3),
  marginRight: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const ErrorTypography = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  color: theme.colours.red,
}));

const InfoTypography = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  color: theme.colours.blue,
}));

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  color: theme.colours.blue,
}));

const textFieldStyles = { marginTop: 1, width: '352px' };
const buttonStyles = { width: '352px' };
const textStyles = { fontSize: 14, paddingBottom: '24px', paddingTop: '12px' };

const DividerLine = styled('div')(({ theme }) => ({
  borderBottom: '1px solid',
  color: theme.colours.contrastGrey,
  width: '100%',
}));

const DividerWithText = (props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: React.ReactElement<any, any>;
}): React.ReactElement => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <DividerLine />
      <Box
        sx={{
          paddingRight: 2,
          paddingLeft: 2,
          fontSize: 14,
          color: (theme: Theme) => theme.colours.contrastGrey,
        }}
      >
        {props.children}
      </Box>
      <DividerLine />
    </div>
  );
};

interface LoginPageProps {
  auth: AuthState;
  res?: AppStrings;
}

interface LoginPageDispatchProps {
  verifyUsernameAndPassword: (
    username: string,
    password: string
  ) => Promise<void>;
  resetAuthState: () => Action;
}

export type CombinedLoginProps = LoginPageProps & LoginPageDispatchProps;

export const RedirectLoginScreen = (
  props: CombinedLoginProps & { displayName: string }
): React.ReactElement => {
  const [t] = useTranslation();

  return (
    <RootDiv>
      {props.auth.failedToLogin ? (
        <ErrorTypography>{t('login.login-redirect-error-msg')}</ErrorTypography>
      ) : null}
      <Button
        variant="contained"
        color="primary"
        sx={buttonStyles}
        disabled={props.auth.loading}
        onClick={() => {
          if (props.auth.provider.redirectUrl) {
            window.location.href = props.auth.provider.redirectUrl;
          }
        }}
      >
        <Typography color="inherit" noWrap sx={{ marginTop: '3px' }}>
          {`Login with ${props.displayName}`}
        </Typography>
      </Button>
    </RootDiv>
  );
};

export const CredentialsLoginScreen = (
  props: CombinedLoginProps
): React.ReactElement => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const isInputValid = (): boolean => username !== '' && password !== '';

  const [t] = useTranslation();

  const { verifyUsernameAndPassword } = props;

  const login = React.useCallback(async () => {
    return await verifyUsernameAndPassword(username, password);
  }, [password, verifyUsernameAndPassword, username]);

  return (
    <RootDiv
      onKeyDown={(e) => {
        if (
          !props.auth.provider.redirectUrl &&
          e.key === 'Enter' &&
          isInputValid()
        ) {
          login();
        }
      }}
    >
      {props.auth.failedToLogin ? (
        <ErrorTypography>{t('login.login-error-msg')}</ErrorTypography>
      ) : null}
      {props.auth.signedOutDueToTokenInvalidation ? (
        <InfoTypography>{t('login.token-invalid-msg')}</InfoTypography>
      ) : null}
      <TextField
        variant="standard"
        sx={textFieldStyles}
        label={t('login.username-placeholder')}
        value={username}
        onChange={(e) => setUsername(e.currentTarget.value)}
        inputProps={{ 'aria-label': t('login.username-arialabel') }}
        disabled={props.auth.loading}
        color="secondary"
      />
      <TextField
        variant="standard"
        sx={textFieldStyles}
        label={t('login.password-placeholder')}
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        type="password"
        inputProps={{ 'aria-label': t('login.password-arialabel') }}
        disabled={props.auth.loading}
        color="secondary"
      />
      <Typography sx={{ ...textStyles, marginLeft: 'auto' }}>
        <Link href={t('login.forgotten-your-password-link')} underline="hover">
          {t('login.forgotten-your-password')}
        </Link>
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={buttonStyles}
        disabled={!isInputValid() || props.auth.loading}
        onClick={login}
      >
        <Typography
          color="inherit"
          noWrap
          sx={{ marginTop: '3px', fontWeight: 'bold' }}
        >
          {t('login.login-button')}
        </Typography>
      </Button>
      <Typography sx={textStyles}>
        <Link href={t('login.need-help-signing-in-link')} underline="hover">
          {t('login.need-help-signing-in')}
        </Link>
      </Typography>
      <DividerWithText>
        <Typography>or</Typography>
      </DividerWithText>
      <Typography
        sx={{
          ...textStyles,
          paddingBottom: undefined,
          color: (theme: Theme) => theme.colours.contrastGrey,
        }}
      >
        <Trans t={t} i18nKey="login.dont-have-an-account-sign-up-now">
          Don&#39;t have an account?{' '}
          <Link
            href={t('login.dont-have-an-account-sign-up-now-link')}
            underline="hover"
          >
            Sign up now
          </Link>
        </Trans>
      </Typography>
    </RootDiv>
  );
};

export const AnonLoginScreen = (
  props: CombinedLoginProps
): React.ReactElement => {
  const [t] = useTranslation();

  const { verifyUsernameAndPassword } = props;

  const login = React.useCallback(async () => {
    return await verifyUsernameAndPassword('', '');
  }, [verifyUsernameAndPassword]);

  return (
    <RootDiv
      data-testid="anon-login-screen"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          login();
        }
      }}
    >
      {props.auth.failedToLogin ? (
        <ErrorTypography>{t('login.login-error-msg')}</ErrorTypography>
      ) : null}
      {props.auth.signedOutDueToTokenInvalidation ? (
        <InfoTypography>{t('login.token-invalid-msg')}</InfoTypography>
      ) : null}
      <Button
        variant="contained"
        color="primary"
        sx={buttonStyles}
        onClick={login}
      >
        <Typography color="inherit" noWrap sx={{ marginTop: '3px' }}>
          {t('login.login-button')}
        </Typography>
      </Button>
    </RootDiv>
  );
};

export const LoginSelector = (
  props: CombinedLoginProps & {
    authenticators: Authenticator[];
    authenticator?: string;
    changeAuthenticator: (mnemonic: string) => void;
  }
): React.ReactElement => {
  return (
    <FormControl
      sx={{
        minWidth: '120px',
        paddingTop: '8px',
        paddingBottom: '16px',
        fontSize: '14px',
      }}
    >
      <InputLabel
        id="mnemonic-select"
        htmlFor="select-mnemonic"
        color="secondary"
      >
        Authenticator
      </InputLabel>
      <Select
        sx={textFieldStyles}
        id="select-mnemonic"
        labelId="mnemonic-select"
        value={props.authenticator}
        onChange={(e) => {
          props.changeAuthenticator(e.target.value as string);
        }}
        color="secondary"
      >
        {props.authenticators.map((authenticator) => (
          <MenuItem key={authenticator.key} value={authenticator.key}>
            {authenticator.displayName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export const LoginPageComponent = (
  props: CombinedLoginProps
): React.ReactElement => {
  const [t] = useTranslation();
  const [authenticator, setAuthenticator] = useState<string | undefined>(
    props.auth.provider.getAuthenticator?.() ||
      (props.auth.provider.authenticators?.length === 1
        ? props.auth.provider.authenticators[0].key
        : undefined)
  );
  const [initialisedAuth, setInitialisedAuth] = useState<boolean>(false);
  const location = useLocation<{ referrer?: string } | undefined>();

  const { verifyUsernameAndPassword } = props;

  const login = React.useCallback(async () => {
    return await verifyUsernameAndPassword('', location.search);
  }, [verifyUsernameAndPassword, location.search]);

  const changeAuthenticator = React.useCallback(
    (newAuthenticator: string, disableSideEffects?: boolean) => {
      setAuthenticator(newAuthenticator);
      props.auth.provider.setAuthenticator?.(
        newAuthenticator,
        disableSideEffects
      );
    },
    [props.auth.provider]
  );

  React.useEffect(() => {
    const setupAuthenticator = async () => {
      if (props.auth.provider.initialise) {
        await props.auth.provider.initialise();
        setInitialisedAuth(true);
      } else {
        setInitialisedAuth(true);
      }
    };
    setupAuthenticator();
  }, [props.auth.provider]);

  const initialLoadEffectRan = React.useRef(false);
  React.useEffect(() => {
    if (!initialLoadEffectRan.current) {
      const oidcConfigurationUrl = sessionStorage.getItem(
        'oidcConfigurationUrl'
      );
      if (
        (props.auth.provider.redirectUrl || oidcConfigurationUrl) &&
        !props.auth.loading &&
        !props.auth.failedToLogin &&
        initialisedAuth
      ) {
        if (location.search) {
          // disable sideEffects for setting authenticator just before OIDC login
          // as otherwise this will override needed variables such as the code verifier
          changeAuthenticator(`${oidcConfigurationUrl}`, true);
          login();
        } else {
          // if we're not doing a login redirect, safe to init a single authenticator
          // otherwise doing this elsewhere overwrites the OIDC variables and breaks the login flow
          if (props.auth.provider.authenticators?.length === 1)
            // if only one authenticator, then initialise with that authenticator
            changeAuthenticator(props.auth.provider.authenticators[0].key);
        }
        initialLoadEffectRan.current = true;
      }
    }
  });

  React.useEffect(() => {
    //Only remove error if not visiting due to token invalidation
    if (props.auth.failedToLogin && !props.auth.signedOutDueToTokenInvalidation)
      props.resetAuthState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  let LoginScreen: React.ReactElement | null = null;

  let auth;
  const authenticators = props.auth.provider.authenticators;
  if (initialisedAuth && typeof authenticator === 'undefined') {
    LoginScreen = <CredentialsLoginScreen {...props} />;

    if (props.auth.provider.redirectUrl) {
      LoginScreen = <RedirectLoginScreen {...props} displayName="unknown" />;
    }
  } else {
    if (
      authenticators?.find((a) => a.key === authenticator && a.type == 'anon')
    ) {
      // anon
      LoginScreen = <AnonLoginScreen {...props} />;
    } else if (
      authenticators?.find(
        (a) => a.key === authenticator && a.type == 'userpass'
      )
    ) {
      // user/pass
      LoginScreen = <CredentialsLoginScreen {...props} />;
    } else if (
      (auth = authenticators?.find(
        (a) => a.key === authenticator && a.type == 'redirect'
      ))
    ) {
      // redirect
      LoginScreen = (
        <RedirectLoginScreen {...props} displayName={auth.displayName} />
      );
    } else {
      // unrecognised authenticator type
    }
  }

  return (
    <RootDiv>
      <Paper
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '24px',
          width: '400px',
        }}
      >
        <Avatar
          sx={{
            margin: '12px',
            backgroundColor: (theme: Theme) => theme.colours.lightBlue,
            color: '#FFFFFF',
            alignItems: 'center',
          }}
        >
          <LockOutlinedIcon />
        </Avatar>
        <Typography
          component="h1"
          variant="h5"
          sx={{
            fontWeight: 'bold',
            paddingBottom: '16px',
          }}
        >
          {t('login.title')}
        </Typography>

        {authenticators && authenticators.length > 1 && (
          <LoginSelector
            {...props}
            authenticators={authenticators}
            authenticator={authenticator}
            changeAuthenticator={changeAuthenticator}
          />
        )}
        {LoginScreen}
        {props.auth.loading || !initialisedAuth ? (
          <StyledCircularProgress />
        ) : null}
      </Paper>
    </RootDiv>
  );
};

const mapStateToProps = (state: StateType): LoginPageProps => ({
  auth: state.scigateway.authorisation,
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): LoginPageDispatchProps => ({
  verifyUsernameAndPassword: (username: string, password: string) =>
    dispatch(verifyUsernameAndPassword(username.trim(), password)),
  resetAuthState: () => dispatch(resetAuthState()),
});

export const UnconnectedLoginPage = LoginPageComponent;

export default connect(mapStateToProps, mapDispatchToProps)(LoginPageComponent);
