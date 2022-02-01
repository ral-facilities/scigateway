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
import { StyleRules } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import {
  verifyUsernameAndPassword,
  resetAuthState,
} from '../state/actions/scigateway.actions';
import { AppStrings, NotificationType } from '../state/scigateway.types';
import { StateType, AuthState, ICATAuthenticator } from '../state/state.types';
import { UKRITheme } from '../theming';
import { Location } from 'history';
import { Select, FormControl, InputLabel, MenuItem, Link } from '@mui/material';
import axios from 'axios';
import log from 'loglevel';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const useStyles = makeStyles(
  (theme: Theme): StyleRules =>
    createStyles({
      root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 'auto',
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
      },
      avatar: {
        margin: '12px',
        backgroundColor: (theme as UKRITheme).colours.lightBlue,
        color: '#FFFFFF',
        alignItems: 'center',
      },
      paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '24px',
        width: 400,
      },
      textField: {
        marginTop: theme.spacing(1),
        width: '352px',
      },
      formControl: {
        margin: theme.spacing(1),
        minWidth: 200,
      },
      button: {
        width: '352px',
      },
      warning: {
        marginTop: theme.spacing(1),
        color: (theme as UKRITheme).colours.red,
      },
      info: {
        marginTop: theme.spacing(1),
        color: (theme as UKRITheme).colours.blue,
      },
      spinner: {
        marginBottom: '24px',
      },
      forgotPasswordText: {
        fontSize: 14,
        marginLeft: 'auto',
        paddingBottom: '24px',
        paddingTop: '12px',
      },
      registerMessage: {
        fontSize: 14,
        paddingBottom: '24px',
        paddingTop: '12px',
        color: (theme as UKRITheme).colours.contrastGrey,
      },
      helpMessage: {
        fontSize: 14,
        paddingBottom: '12px',
        paddingTop: '24px',
      },
      orText: { display: 'flex', fontSize: 14 },
    })
);

const useDividerStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },
    border: {
      borderBottom: '1px solid',
      color: (theme as UKRITheme).colours.contrastGrey,
      width: '100%',
    },
    content: {
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      fontSize: 14,
      color: (theme as UKRITheme).colours.contrastGrey,
    },
  })
);

const DividerWithText = (props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: React.ReactElement<any, any>;
}): React.ReactElement => {
  const classes = useDividerStyles();
  return (
    <div className={classes.container}>
      <div className={classes.border} />
      <span className={classes.content}>{props.children}</span>
      <div className={classes.border} />
    </div>
  );
};

interface LoginPageProps {
  auth: AuthState;
  res?: AppStrings;
  location: Location;
}

interface LoginPageDispatchProps {
  verifyUsernameAndPassword: (
    username: string,
    password: string,
    mnemonic?: string,
    authUrl?: string
  ) => Promise<void>;
  resetAuthState: () => Action;
}

export type CombinedLoginProps = LoginPageProps & LoginPageDispatchProps;

export const RedirectLoginScreen = (
  props: CombinedLoginProps
): React.ReactElement => {
  const [t] = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {props.auth.failedToLogin ? (
        <Typography className={classes.warning}>
          {t('login.login-redirect-error-msg')}
        </Typography>
      ) : null}
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        disabled={props.auth.loading}
        onClick={() => {
          if (props.auth.provider.redirectUrl) {
            window.location.href = props.auth.provider.redirectUrl;
          }
        }}
      >
        <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
          Login with Github
        </Typography>
      </Button>
    </div>
  );
};

export const CredentialsLoginScreen = (
  props: CombinedLoginProps & {
    mnemonic?: string;
    authUrl?: string;
  }
): React.ReactElement => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const isInputValid = (): boolean => username !== '' && password !== '';

  const [t] = useTranslation();
  const classes = useStyles();

  return (
    <div
      className={classes.root}
      onKeyPress={(e) => {
        if (
          !props.auth.provider.redirectUrl &&
          e.key === 'Enter' &&
          isInputValid()
        ) {
          props.verifyUsernameAndPassword(
            username,
            password,
            props.mnemonic,
            props.authUrl
          );
        }
      }}
    >
      {props.auth.failedToLogin ? (
        <Typography className={classes.warning}>
          {t('login.login-error-msg')}
        </Typography>
      ) : null}
      {props.auth.signedOutDueToTokenInvalidation ? (
        <Typography className={classes.info}>
          {t('login.token-invalid-msg')}
        </Typography>
      ) : null}
      <TextField
        variant="standard"
        className={classes.textField}
        label={t('login.username-placeholder')}
        value={username}
        onChange={(e) => setUsername(e.currentTarget.value)}
        inputProps={{ 'aria-label': t('login.username-arialabel') }}
        disabled={props.auth.loading}
        color="secondary"
      />
      <TextField
        variant="standard"
        className={classes.textField}
        label={t('login.password-placeholder')}
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        type="password"
        inputProps={{ 'aria-label': t('login.password-arialabel') }}
        disabled={props.auth.loading}
        color="secondary"
      />
      <Typography className={classes.forgotPasswordText}>
        <Link href={t('login.forgotten-your-password-link')} underline="hover">
          {t('login.forgotten-your-password')}
        </Link>
      </Typography>
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        disabled={!isInputValid() || props.auth.loading}
        onClick={() => {
          props.verifyUsernameAndPassword(
            username,
            password,
            props.mnemonic,
            props.authUrl
          );
        }}
      >
        <Typography
          color="inherit"
          noWrap
          style={{ marginTop: 3, fontWeight: 'bold' }}
        >
          {t('login.login-button')}
        </Typography>
      </Button>
      <Typography className={classes.helpMessage}>
        <Link href={t('login.need-help-signing-in-link')} underline="hover">
          {t('login.need-help-signing-in')}
        </Link>
      </Typography>
      <DividerWithText>
        <Typography>or</Typography>
      </DividerWithText>
      <Typography className={classes.registerMessage}>
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
    </div>
  );
};

export const AnonLoginScreen = (
  props: CombinedLoginProps & {
    mnemonic?: string;
    authUrl?: string;
  }
): React.ReactElement => {
  const [t] = useTranslation();
  const classes = useStyles();

  return (
    <div
      className={classes.root}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          props.verifyUsernameAndPassword(
            '',
            '',
            props.mnemonic,
            props.authUrl
          );
        }
      }}
    >
      {props.auth.failedToLogin ? (
        <Typography className={classes.warning}>
          {t('login.login-error-msg')}
        </Typography>
      ) : null}
      {props.auth.signedOutDueToTokenInvalidation ? (
        <Typography className={classes.info}>
          {t('login.token-invalid-msg')}
        </Typography>
      ) : null}
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={() => {
          props.verifyUsernameAndPassword(
            '',
            '',
            props.mnemonic,
            props.authUrl
          );
        }}
      >
        <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
          {t('login.login-button')}
        </Typography>
      </Button>
    </div>
  );
};

export const LoginSelector = (
  props: CombinedLoginProps & {
    mnemonics: ICATAuthenticator[];
    mnemonic?: string;
    setMnemonic: (mnemonic: string) => void;
  }
): React.ReactElement => {
  const classes = useStyles();

  return (
    <FormControl
      style={{
        minWidth: 120,
        paddingTop: '8px',
        paddingBottom: '16px',
        fontSize: 14,
      }}
    >
      <InputLabel htmlFor="mnemonic-select" color="secondary">
        Authenticator
      </InputLabel>
      <Select
        className={classes.textField}
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
    .catch((err) => {
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
  const location = useLocation();
  const classes = useStyles();

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
      props.location.search &&
      !props.auth.loading &&
      !props.auth.failedToLogin
    ) {
      if (props.location.search) {
        props.verifyUsernameAndPassword(
          '',
          props.location.search,
          mnemonic,
          authUrl
        );
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
    LoginScreen = (
      <CredentialsLoginScreen
        {...props}
        mnemonic={mnemonic}
        authUrl={authUrl}
      />
    );
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
      LoginScreen = (
        <AnonLoginScreen {...props} mnemonic={mnemonic} authUrl={authUrl} />
      );
    } else if (
      mnemonics.find(
        (authenticator) =>
          authenticator.mnemonic === mnemonic &&
          authenticator.keys.find((x) => x.name === 'username') &&
          authenticator.keys.find((x) => x.name === 'password')
      )
    ) {
      // user/pass
      LoginScreen = (
        <CredentialsLoginScreen
          {...props}
          mnemonic={mnemonic}
          authUrl={authUrl}
        />
      );
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
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography
          component="h1"
          variant="h5"
          style={{
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
        {props.auth.loading ? (
          <CircularProgress className={classes.spinner} />
        ) : null}
      </Paper>
    </div>
  );
};

const mapStateToProps = (state: StateType): LoginPageProps => ({
  auth: state.scigateway.authorisation,
  location: state.router.location,
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): LoginPageDispatchProps => ({
  verifyUsernameAndPassword: (
    username: string,
    password: string,
    mnemonic: string | undefined,
    authUrl?: string
  ) =>
    dispatch(
      verifyUsernameAndPassword(
        username.trim(),
        password,
        mnemonic,
        authUrl ?? ''
      )
    ),
  resetAuthState: () => dispatch(resetAuthState()),
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginPageComponent);
