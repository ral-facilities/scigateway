import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {
  withStyles,
  Theme,
  StyleRules,
  createStyles,
  WithStyles,
} from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { verifyUsernameAndPassword } from '../state/actions/daaas.actions';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType, AuthState } from '../state/state.types';

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
      backgroundColor: theme.palette.secondary.main,
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
  });

interface LoginPageProps {
  failedToLogin: boolean;
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

  public render(): React.ReactElement {
    const { props } = this;
    return (
      <div className={props.classes.root}>
        <Paper className={props.classes.paper}>
          <Avatar className={props.classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          {props.failedToLogin ? (
            <div>
              <Typography className={props.classes.warning}>
                Failed to log in. Invalid username or password.
              </Typography>
            </div>
          ) : (
            <div />
          )}
          <div>
            <TextField
              className={props.classes.textField}
              label="Username*"
              value={this.state.username}
              onChange={this.updateUserName}
            />
          </div>
          <div>
            <TextField
              className={props.classes.textField}
              label="Password*"
              value={this.state.password}
              onChange={this.updatePassword}
              type="password"
            />
          </div>
          <div>
            <Button
              variant="contained"
              color="primary"
              className={props.classes.button}
              onClick={() =>
                props.verifyUsernameAndPassword(
                  this.state.username,
                  this.state.password
                )
              }
            >
              <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
                sign in
              </Typography>
            </Button>
          </div>
        </Paper>
      </div>
    );
  }
}

const mapStateToProps = (state: StateType): AuthState => ({
  token: state.daaas.authorisation.token,
  failedToLogin: state.daaas.authorisation.failedToLogin,
  loggedIn: state.daaas.authorisation.loggedIn,
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
