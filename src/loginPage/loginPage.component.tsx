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
import {
  verifyUsernameAndPassword,
  loadAuthProvider,
} from '../state/actions/scigateway.actions';
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
      color: theme.palette.primary.main,
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
    password: string
  ) => Promise<void>;
  changeMnemonic: (mnemonic: string, authUrl: string | undefined) => void;
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
  props: CombinedLoginProps
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
          props.verifyUsernameAndPassword(username, password);
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
          props.verifyUsernameAndPassword(username, password);
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
  props: CombinedLoginProps
): React.ReactElement => (
  <div
    className={props.classes.root}
    onKeyPress={(e) => {
      if (e.key === 'Enter') {
        props.verifyUsernameAndPassword('', '');
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
        props.verifyUsernameAndPassword('', '');
      }}
    >
      <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
        {getString(props.res, 'login-button')}
      </Typography>
    </Button>
  </div>
);

export const LoginSelector = (
  props: CombinedLoginProps & { mnemonics: ICATAuthenticator[] }
): React.ReactElement => {
  const mnemonics = props.mnemonics;
  const mnemonic = props.auth.provider.mnemonic || '';
  const setMnemonic = props.changeMnemonic;
  const authUrl = props.auth.provider.authUrl;

  return (
    <FormControl style={{ minWidth: 120 }}>
      <InputLabel htmlFor="mnemonic-select" color="secondary">
        Authenticator
      </InputLabel>
      <Select
        className={props.classes.textField}
        id="select-mnemonic"
        labelId="mnemonic-select"
        value={mnemonic}
        onChange={(e) => {
          setMnemonic(e.target.value as string, authUrl);
        }}
        color="secondary"
      >
        {mnemonics.map((authenticator) => (
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
  const mnemonic = props.auth.provider.mnemonic;
  const authUrl = props.auth.provider.authUrl;
  const [mnemonics, setMnemonics] = useState<ICATAuthenticator[]>([]);
  const [fetchedMnemonics, setFetchedMnemonics] = useState<boolean>(false);

  const changeMnemonic = props.changeMnemonic;
  React.useEffect(() => {
    if (typeof mnemonic !== 'undefined' && !fetchedMnemonics) {
      fetchMnemonics(authUrl).then((mnemonics) => {
        const nonAdminAuthenticators = mnemonics.filter(
          (authenticator) => !authenticator.admin
        );
        setMnemonics(nonAdminAuthenticators);
        setFetchedMnemonics(true);
        if (nonAdminAuthenticators.length === 1)
          changeMnemonic(nonAdminAuthenticators[0].mnemonic, authUrl);
      });
    }
  }, [changeMnemonic, mnemonic, fetchedMnemonics, authUrl]);

  React.useEffect(() => {
    if (
      props.auth.provider.redirectUrl &&
      props.location.search &&
      !props.auth.loading &&
      !props.auth.failedToLogin
    ) {
      if (props.location.search) {
        props.verifyUsernameAndPassword('', props.location.search);
      }
    }
  });

  let LoginScreen: React.ReactElement | null = null;

  if (typeof mnemonic === 'undefined') {
    LoginScreen = <CredentialsLoginScreen {...props} />;
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
      LoginScreen = <AnonLoginScreen {...props} />;
    } else if (
      mnemonics.find(
        (authenticator) =>
          authenticator.mnemonic === mnemonic &&
          authenticator.keys.find((x) => x.name === 'username') &&
          authenticator.keys.find((x) => x.name === 'password')
      )
    ) {
      // user/pass
      LoginScreen = <CredentialsLoginScreen {...props} />;
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
          <LoginSelector {...props} mnemonics={mnemonics} />
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
  verifyUsernameAndPassword: (username, password) =>
    dispatch(verifyUsernameAndPassword(username.trim(), password)),
  changeMnemonic: (mnemonic, authUrl) =>
    dispatch(loadAuthProvider(`icat.${mnemonic}`, `${authUrl}`)),
});

export const LoginPageWithoutStyles = LoginPageComponent;
export const LoginPageWithStyles = withStyles(styles)(LoginPageComponent);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPageWithStyles);
