import React, { useState } from 'react';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import {
  withStyles,
  Theme,
  StyleRules,
  createStyles,
  WithStyles,
} from '@material-ui/core/styles';
import { verifyUsernameAndPassword } from '../state/actions/scigateway.actions';
import { AppStrings, NotificationType } from '../state/scigateway.types';
import { StateType, AuthState, ICATAuthenticator } from '../state/state.types';
import { UKRITheme } from '../theming';
import { getAppStrings, getString } from '../state/strings';
import { Location } from 'history';
import { Select, FormControl, InputLabel, MenuItem } from '@material-ui/core';
import axios from 'axios';
import log from 'loglevel';

const styles = (theme: Theme): StyleRules =>
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
      margin: theme.spacing(1),
      backgroundColor: (theme as UKRITheme).ukri.bright.orange,
    },
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: theme.spacing(3),
      [theme.breakpoints.up(400 + theme.spacing(6))]: {
        width: 400,
        marginLeft: 'auto',
        marginRight: 'auto',
      },
    },
    textField: {
      marginTop: theme.spacing(1),
      minWidth: 200,
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 200,
    },
    button: {
      marginTop: `${theme.spacing(1)}px`,
    },
    warning: {
      marginTop: `${theme.spacing(1)}px`,
      color: 'red',
    },
    info: {
      marginTop: `${theme.spacing(1)}px`,
      color: theme.palette.secondary.main,
    },
    spinner: {
      marginTop: 15,
    },
  });

interface LoginPageProps {
  auth: AuthState;
  res: AppStrings | undefined;
  location: Location;
}

interface LoginPageDispatchProps {
  verifyUsernameAndPassword: (
    username: string,
    password: string,
    mnemonic: string | undefined,
    authUrl: string | undefined
  ) => Promise<void>;
}

export type CombinedLoginProps = LoginPageProps &
  LoginPageDispatchProps &
  WithStyles<typeof styles>;

export const RedirectLoginScreen = (
  props: CombinedLoginProps
): React.ReactElement => (
  <div className={props.classes.root}>
    {props.auth.failedToLogin ? (
      <Typography className={props.classes.warning}>
        {getString(props.res, 'login-redirect-error-msg')}
      </Typography>
    ) : null}
    <Button
      variant="contained"
      color="primary"
      className={props.classes.button}
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

export const CredentialsLoginScreen = (
  props: CombinedLoginProps & {
    mnemonic: string | undefined;
    authUrl: string | undefined;
  }
): React.ReactElement => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const isInputValid = (): boolean => username !== '' && password !== '';

  return (
    <div
      className={props.classes.root}
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
        <Typography className={props.classes.warning}>
          {getString(props.res, 'login-error-msg')}
        </Typography>
      ) : null}
      {props.auth.signedOutDueToTokenInvalidation ? (
        <Typography className={props.classes.info}>
          {getString(props.res, 'token-invalid-msg')}
        </Typography>
      ) : null}
      <TextField
        className={props.classes.textField}
        label={getString(props.res, 'username-placeholder')}
        value={username}
        onChange={(e) => setUsername(e.currentTarget.value)}
        disabled={props.auth.loading}
        color="secondary"
      />
      <TextField
        className={props.classes.textField}
        label={getString(props.res, 'password-placeholder')}
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        type="password"
        disabled={props.auth.loading}
        color="secondary"
      />
      <Button
        variant="contained"
        color="primary"
        className={props.classes.button}
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
        <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
          {getString(props.res, 'login-button')}
        </Typography>
      </Button>
    </div>
  );
};

export const AnonLoginScreen = (
  props: CombinedLoginProps & {
    mnemonic: string | undefined;
    authUrl: string | undefined;
  }
): React.ReactElement => (
  <div
    className={props.classes.root}
    onKeyPress={(e) => {
      if (e.key === 'Enter') {
        props.verifyUsernameAndPassword('', '', props.mnemonic, props.authUrl);
      }
    }}
  >
    {props.auth.failedToLogin ? (
      <Typography className={props.classes.warning}>
        {getString(props.res, 'login-error-msg')}
      </Typography>
    ) : null}
    {props.auth.signedOutDueToTokenInvalidation ? (
      <Typography className={props.classes.info}>
        {getString(props.res, 'token-invalid-msg')}
      </Typography>
    ) : null}
    <Button
      variant="contained"
      color="primary"
      className={props.classes.button}
      onClick={() => {
        props.verifyUsernameAndPassword('', '', props.mnemonic, props.authUrl);
      }}
    >
      <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
        {getString(props.res, 'login-button')}
      </Typography>
    </Button>
  </div>
);

export const LoginSelector = (
  props: CombinedLoginProps & {
    mnemonics: ICATAuthenticator[];
    mnemonic: string | undefined;
    setMnemonic: React.Dispatch<React.SetStateAction<string | undefined>>;
  }
): React.ReactElement => {
  return (
    <FormControl style={{ minWidth: 120 }}>
      <InputLabel htmlFor="mnemonic-select" color="secondary">
        Authenticator
      </InputLabel>
      <Select
        className={props.classes.textField}
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

function fetchMnemonics(
  authUrl: string | undefined
): Promise<ICATAuthenticator[]> {
  return axios
    .get(`${authUrl}/authenticators`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      log.error('Failed to fetch authenticator information from ICAT');
      document.dispatchEvent(
        new CustomEvent('scigateway', {
          detail: {
            type: NotificationType,
            payload: {
              message: 'Failed to fetch authenticator information from ICAT',
              severity: 'error',
            },
          },
        })
      );
      return [];
    });
}

const LoginPageComponent = (props: CombinedLoginProps): React.ReactElement => {
  const authUrl = props.auth.provider.authUrl;
  const [mnemonics, setMnemonics] = useState<ICATAuthenticator[]>([]);
  const [fetchedMnemonics, setFetchedMnemonics] = useState<boolean>(false);
  const [mnemonic, setMnemonic] = useState<string | undefined>(
    props.auth.provider.mnemonic
  );

  React.useEffect(() => {
    if (typeof mnemonic !== 'undefined' && !fetchedMnemonics) {
      fetchMnemonics(authUrl).then((mnemonics) => {
        const nonAdminAuthenticators = mnemonics.filter(
          (authenticator) => !authenticator.admin
        );
        setMnemonics(nonAdminAuthenticators);
        setFetchedMnemonics(true);
        if (nonAdminAuthenticators.length === 1)
          setMnemonic(nonAdminAuthenticators[0].mnemonic);
      });
    }
  }, [mnemonic, fetchedMnemonics, authUrl]);

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
    <div className={props.classes.root}>
      <Paper className={props.classes.paper}>
        <Avatar className={props.classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {getString(props.res, 'title')}
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
          <CircularProgress className={props.classes.spinner} />
        ) : null}
      </Paper>
    </div>
  );
};

const mapStateToProps = (state: StateType): LoginPageProps => ({
  auth: state.scigateway.authorisation,
  res: getAppStrings(state, 'login'),
  location: state.router.location,
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): LoginPageDispatchProps => ({
  verifyUsernameAndPassword: (
    username: string,
    password: string,
    mnemonic: string | undefined,
    authUrl: string | undefined
  ) =>
    dispatch(
      verifyUsernameAndPassword(
        username.trim(),
        password,
        mnemonic !== undefined ? mnemonic : '',
        authUrl !== undefined ? authUrl : ''
      )
    ),
});

export const LoginPageWithoutStyles = LoginPageComponent;
export const LoginPageWithStyles = withStyles(styles)(LoginPageComponent);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPageWithStyles);
