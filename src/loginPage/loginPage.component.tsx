import React from 'react';
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
import { verifyUsernameAndPassword } from '../state/actions/daaas.actions';
import { AppStrings } from '../state/daaas.types';
import { StateType, AuthState } from '../state/state.types';
import { UKRITheme } from '../theming';
import { getAppStrings, getString } from '../state/strings';

interface LoginPageState {
  username: string;
  password: string;
}

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: 'auto',
      marginLeft: theme.spacing.unit * 3,
      marginRight: theme.spacing.unit * 3,
    },
    avatar: {
      margin: theme.spacing.unit,
      backgroundColor: (theme as UKRITheme).ukri.orange,
    },
    paper: {
      marginTop: theme.spacing.unit * 8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: `${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px ${theme
        .spacing.unit * 3}px`,
      [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
        width: 400,
        marginLeft: 'auto',
        marginRight: 'auto',
      },
    },
    textField: {
      marginTop: theme.spacing.unit,
    },
    button: {
      marginTop: `${theme.spacing.unit * 3}px`,
    },
    warning: {
      marginTop: `${theme.spacing.unit * 3}px`,
      color: 'red',
    },
    spinner: {
      marginTop: 15,
    },
  });

interface LoginPageProps {
  auth: AuthState;
  res: AppStrings | undefined;
}

interface LoginPageDispatchProps {
  verifyUsernameAndPassword: (
    username: string,
    password: string
  ) => Promise<void>;
}

type CombinedLoginProps = LoginPageProps &
  LoginPageDispatchProps &
  WithStyles<typeof styles>;

class LoginPageComponent extends React.Component<
  CombinedLoginProps,
  LoginPageState,
  {}
> {
  public constructor(props: CombinedLoginProps) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };

    this.updateUserName = this.updateUserName.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
  }

  private updateUserName(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({
      ...this.state,
      username: event.currentTarget.value,
    });
  }

  private updatePassword(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({
      ...this.state,
      password: event.currentTarget.value,
    });
  }

  private isInputValid(): boolean {
    return this.state.username !== '' && this.state.password !== '';
  }

  public render(): React.ReactElement {
    const { props } = this;
    return (
      <div className={props.classes.root}>
        <Paper
          className={props.classes.paper}
          onKeyPress={e => {
            if (e.key === 'Enter' && this.isInputValid()) {
              props.verifyUsernameAndPassword(
                this.state.username,
                this.state.password
              );
            }
          }}
        >
          <Avatar className={props.classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {getString(props.res, 'title')}
          </Typography>
          {props.auth.failedToLogin ? (
            <Typography className={props.classes.warning}>
              {getString(props.res, 'login-error-msg')}
            </Typography>
          ) : null}
          <TextField
            className={props.classes.textField}
            label={getString(props.res, 'username-placeholder')}
            value={this.state.username}
            onChange={this.updateUserName}
            disabled={props.auth.loading}
          />
          <TextField
            className={props.classes.textField}
            label={getString(props.res, 'password-placeholder')}
            value={this.state.password}
            onChange={this.updatePassword}
            type="password"
            disabled={props.auth.loading}
          />
          <Button
            variant="contained"
            color="primary"
            className={props.classes.button}
            disabled={!this.isInputValid() || props.auth.loading}
            onClick={() => {
              props.verifyUsernameAndPassword(
                this.state.username,
                this.state.password
              );
            }}
          >
            <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
              {getString(props.res, 'login-button')}
            </Typography>
          </Button>
          {props.auth.loading ? (
            <CircularProgress className={props.classes.spinner} />
          ) : null}
        </Paper>
      </div>
    );
  }
}

const mapStateToProps = (state: StateType): LoginPageProps => ({
  auth: state.daaas.authorisation,
  res: getAppStrings(state, 'login'),
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): LoginPageDispatchProps => ({
  verifyUsernameAndPassword: (username, password) =>
    dispatch(verifyUsernameAndPassword(username, password)),
});

export const LoginPageWithStyles = withStyles(styles)(LoginPageComponent);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPageWithStyles);
