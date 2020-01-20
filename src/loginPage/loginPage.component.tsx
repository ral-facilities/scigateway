import React, { useState, useEffect } from 'react';
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
import { AppStrings } from '../state/scigateway.types';
import { StateType, AuthState } from '../state/state.types';
import { UKRITheme } from '../theming';
import { getAppStrings, getString } from '../state/strings';
import { Location } from 'history';

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
      // material-ui v4 upgrade
      margin: theme.spacing(1),
      backgroundColor: (theme as UKRITheme).ukri.orange,
    },
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      // material-ui v4 upgrade
      padding: `${theme.spacing(3)}px ${theme.spacing(3)}px ${theme.spacing(
        3
      )}px`,
      [theme.breakpoints.up(400 + theme.spacing(6))]: {
        width: 400,
        marginLeft: 'auto',
        marginRight: 'auto',
      },
    },
    textField: {
      // material-ui v4 upgrade
      marginTop: theme.spacing(1),
    },
    button: {
      // material-ui v4 upgrade
      marginTop: `${theme.spacing(1)}px`,
    },
    warning: {
      // material-ui v4 upgrade
      marginTop: `${theme.spacing(1)}px`,
      color: 'red',
    },
    info: {
      // material-ui v4 upgrade
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
      onKeyPress={e => {
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
        onChange={e => setUsername(e.currentTarget.value)}
        disabled={props.auth.loading}
      />
      <TextField
        className={props.classes.textField}
        label={getString(props.res, 'password-placeholder')}
        value={password}
        onChange={e => setPassword(e.currentTarget.value)}
        type="password"
        disabled={props.auth.loading}
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

const LoginPageComponent = (props: CombinedLoginProps): React.ReactElement => {
  useEffect(() => {
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

  return (
    <div className={props.classes.root}>
      <Paper className={props.classes.paper}>
        <Avatar className={props.classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {getString(props.res, 'title')}
        </Typography>
        {props.auth.provider.redirectUrl ? (
          <RedirectLoginScreen {...props} />
        ) : (
          <CredentialsLoginScreen {...props} />
        )}
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
    dispatch(verifyUsernameAndPassword(username, password)),
});

export const LoginPageWithoutStyles = LoginPageComponent;
export const LoginPageWithStyles = withStyles(styles)(LoginPageComponent);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPageWithStyles);
