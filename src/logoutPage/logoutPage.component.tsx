import React from 'react';
import { signOut } from '../state/actions/scigateway.actions';
import Button from '@material-ui/core/Button';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { push } from 'connected-react-router';
import Typography from '@material-ui/core/Typography';
import { ThunkDispatch } from 'redux-thunk';
import { Dispatch, Action, AnyAction } from 'redux';
import {
  withStyles,
  Theme,
  StyleRules,
  createStyles,
  WithStyles,
} from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { AppStrings } from '../state/scigateway.types';
import { StateType, User } from '../state/state.types';
import { UKRITheme } from '../theming';
import { getAppStrings, getString } from '../state/strings';
import UserInfo from '../authentication/user';
import { Avatar, Paper } from '@material-ui/core';

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
      backgroundColor: (theme as UKRITheme).colours.orange,
    },
    avataUrl: {
      margin: theme.spacing(1),
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
    },
    username: {
      paddingTop: 3,
      fontWeight: 'bold',
      fontSize: 17,
    },
    button: {
      marginTop: `${theme.spacing(1)}px`,
    },
    info: {
      marginTop: `${theme.spacing(1)}px`,
      color: theme.palette.secondary.main,
    },
  });

interface LogoutPageProps {
  user: User;
  res: AppStrings | undefined;
}

interface LogoutPageDispatchProps {
  signIn: () => Action;
  signOut: () => void;
}
export type CombinedLogoutPageProps = LogoutPageProps &
  LogoutPageDispatchProps &
  WithStyles<typeof styles>;

export const LogoutPageComponent = (
  props: CombinedLogoutPageProps
): React.ReactElement => {
  const logout = (): void => {
    props.signOut();
  };
  return (
    <div className="logout-page">
      <Paper className={props.classes.paper}>
        {props.user.avatarUrl !== '' ? (
          <Avatar
            className={props.classes.avatarUrl}
            alt="user"
            src={props.user.avatarUrl}
          />
        ) : (
          <Avatar className={props.classes.avatar}>
            <AccountCircleIcon />
          </Avatar>
        )}

        <Typography className={props.classes.textField}>
          {getString(props.res, 'username-description')}
        </Typography>
        <Typography className={props.classes.username}>
          {props.user.username}
        </Typography>
        <Typography className={props.classes.info}>
          {getString(props.res, 'logout-message')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          className={props.classes.button}
          onClick={logout}
          data-test-id="logout-page-button"
        >
          <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
            {getString(props.res, 'logout-button')}
          </Typography>
        </Button>
      </Paper>
    </div>
  );
};

export const LogoutPageComponentWithStyles = withStyles(styles)(
  LogoutPageComponent
);

const mapStateToProps = (state: StateType): LogoutPageProps => ({
  user:
    state.scigateway.authorisation.provider.user || new UserInfo('anonymous'),
  res: getAppStrings(state, 'login'),
});

const mapDispatchToProps = (dispatch: Dispatch): LogoutPageDispatchProps => ({
  signIn: () => dispatch(push('/login')),
  signOut: () => {
    const thunkDispatch = dispatch as ThunkDispatch<StateType, null, AnyAction>;
    thunkDispatch(signOut());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LogoutPageComponentWithStyles);
