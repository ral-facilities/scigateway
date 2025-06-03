import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import Avatar from '@mui/material/Avatar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles';
import {
  resetAuthState,
  verifyUsernameAndPassword,
} from '../state/actions/scigateway.actions';
import { AppStrings, NotificationType } from '../state/scigateway.types';
import { AuthState, ICATAuthenticator, StateType } from '../state/state.types';
import {
  Box,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  styled,
} from '@mui/material';
import axios from 'axios';
import log from 'loglevel';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const RootDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: 'auto',
  marginLeft: theme.spacing(3),
  marginRight: theme.spacing(3),
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
    password: string,
    mnemonic?: string
  ) => Promise<void>;
  resetAuthState: () => Action;
}

export type CombinedLoginProps = LoginPageProps & LoginPageDispatchProps;

export const RedirectLoginScreen = (
  props: CombinedLoginProps
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
          Login with Github
        </Typography>
      </Button>
    </RootDiv>
  );
};

export const CredentialsLoginScreen = (
  props: CombinedLoginProps & {
    mnemonic?: string;
  }
): React.ReactElement => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const isInputValid = (): boolean => username !== '' && password !== '';

  const [t] = useTranslation();

  const { verifyUsernameAndPassword, mnemonic } = props;

  const login = React.useCallback(async () => {
    return await verifyUsernameAndPassword(username, password, mnemonic);
  }, [password, verifyUsernameAndPassword, mnemonic, username]);

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
  props: CombinedLoginProps & {
    mnemonic?: string;
  }
): React.ReactElement => {
  const [t] = useTranslation();

  const { verifyUsernameAndPassword, mnemonic } = props;

  const login = React.useCallback(async () => {
    return await verifyUsernameAndPassword('', '', mnemonic);
  }, [verifyUsernameAndPassword, mnemonic]);

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
    mnemonics: ICATAuthenticator[];
    mnemonic?: string;
    setMnemonic: (mnemonic: string) => void;
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
        value={props.mnemonic}
        onChange={(e) => {
          props.setMnemonic(e.target.value as string);
        }}
        color="secondary"
      >
        {props.mnemonics.map((authenticator) => (
          <MenuItem key={authenticator.mnemonic} value={authenticator.mnemonic}>
            {authenticator.friendly || authenticator.mnemonic}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

function fetchMnemonics(authUrl?: string): Promise<ICATAuthenticator[]> {
  return axios
    .get(`${authUrl}/authenticators`)
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      log.error(
        'It is not possible to authenticate you at the moment. Please, try again later'
      );
      document.dispatchEvent(
        new CustomEvent('scigateway', {
          detail: {
            type: NotificationType,
            payload: {
              message:
                'It is not possible to authenticate you at the moment. Please, try again later',
              severity: 'error',
            },
          },
        })
      );
      return [];
    });
}

export const LoginPageComponent = (
  props: CombinedLoginProps
): React.ReactElement => {
  const authUrl = props.auth.provider.authUrl;
  const [mnemonics, setMnemonics] = useState<ICATAuthenticator[]>([]);
  const [fetchedMnemonics, setFetchedMnemonics] = useState<boolean>(false);
  const [t] = useTranslation();
  const [mnemonic, setMnemonic] = useState<string | undefined>(
    props.auth.provider.mnemonic
  );
  const location = useLocation<{ referrer?: string } | undefined>();

  const { verifyUsernameAndPassword } = props;

  const login = React.useCallback(async () => {
    return await verifyUsernameAndPassword('', location.search, mnemonic);
  }, [location.search, verifyUsernameAndPassword, mnemonic]);

  React.useEffect(() => {
    if (typeof mnemonic !== 'undefined' && !fetchedMnemonics) {
      fetchMnemonics(authUrl).then((mnemonics) => {
        const nonAdminAuthenticators = mnemonics.filter(
          (authenticator) =>
            !authenticator.admin && authenticator.mnemonic !== 'anon'
        );
        setMnemonics(nonAdminAuthenticators);
        setFetchedMnemonics(true);
        if (nonAdminAuthenticators.length === 1)
          setMnemonic(nonAdminAuthenticators[0].mnemonic);
      });
    }
  }, [mnemonic, fetchedMnemonics, authUrl]);

  React.useEffect(() => {
    if (typeof props.auth.provider.mnemonic !== 'undefined') {
      setMnemonic(props.auth.provider.mnemonic);
    }
  }, [props.auth.provider.mnemonic]);

  React.useEffect(() => {
    if (
      props.auth.provider.redirectUrl &&
      location.search &&
      !props.auth.loading &&
      !props.auth.failedToLogin
    ) {
      if (location.search) {
        login();
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

  if (typeof mnemonic === 'undefined') {
    LoginScreen = <CredentialsLoginScreen {...props} mnemonic={mnemonic} />;

    if (props.auth.provider.redirectUrl) {
      LoginScreen = <RedirectLoginScreen {...props} />;
    }
  } else {
    if (
      mnemonics.find(
        (authenticator) =>
          authenticator.mnemonic === mnemonic && authenticator.keys.length === 0
      )
    ) {
      // anon
      LoginScreen = <AnonLoginScreen {...props} mnemonic={mnemonic} />;
    } else if (
      mnemonics.find(
        (authenticator) =>
          authenticator.mnemonic === mnemonic &&
          authenticator.keys.find((x) => x.name === 'username') &&
          authenticator.keys.find((x) => x.name === 'password')
      )
    ) {
      // user/pass
      LoginScreen = <CredentialsLoginScreen {...props} mnemonic={mnemonic} />;
    } else if (
      mnemonics.find(
        (authenticator) =>
          authenticator.mnemonic === mnemonic &&
          authenticator.keys.find((x) => x.name === 'token')
      )
    ) {
      // redirect
      LoginScreen = <RedirectLoginScreen {...props} />;
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

        {mnemonics.length > 1 && (
          <LoginSelector
            {...props}
            mnemonics={mnemonics}
            mnemonic={mnemonic}
            setMnemonic={setMnemonic}
          />
        )}
        {LoginScreen}
        {props.auth.loading ||
        (typeof mnemonic !== 'undefined' && !fetchedMnemonics) ? (
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
  verifyUsernameAndPassword: (
    username: string,
    password: string,
    mnemonic: string | undefined
  ) => dispatch(verifyUsernameAndPassword(username.trim(), password, mnemonic)),
  resetAuthState: () => dispatch(resetAuthState()),
});

export const UnconnectedLoginPage = LoginPageComponent;

export default connect(mapStateToProps, mapDispatchToProps)(LoginPageComponent);
