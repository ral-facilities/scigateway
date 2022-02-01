import React, { useState } from 'react';
import { Dispatch, Action, AnyAction } from 'redux';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import {
  IconButton,
  Theme,
  Menu,
  MenuItem,
  Button,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import { alpha } from '@mui/material/styles';
import { StateType, User } from '../state/state.types';
import { getAppStrings, getString } from '../state/strings';
import { signOut } from '../state/actions/scigateway.actions';
import { connect } from 'react-redux';
import { AppStrings } from '../state/scigateway.types';
import { ThunkDispatch } from 'redux-thunk';
import { push } from 'connected-react-router';
import log from 'loglevel';
import UserInfo from '../authentication/user';
import { UKRITheme } from '../theming';

interface UserProfileProps {
  loggedIn: boolean;
  user: User;
  res: AppStrings | undefined;
}

interface UserProfileDispatchProps {
  signIn: () => Action;
  signOut: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    signInButton: {
      margin: theme.spacing(1),
      color: '#FFF',
      backgroundColor: (theme as UKRITheme).colours.lightBlue,
      '&:hover': {
        backgroundColor: alpha((theme as UKRITheme).colours.lightBlue, 0.8),
      },
    },
    userButton: {
      margin: theme.spacing(1),
      color: '#FFF',
    },
    usernameContainer: {
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 15,
      paddingRight: 15,
    },
    username: {
      paddingTop: 3,
      fontWeight: 'bold',
      fontSize: 17,
    },
    avatar: {
      margin: theme.spacing(1),
      cursor: 'pointer',
    },
  })
);

type CombinedUserProfileProps = UserProfileProps & UserProfileDispatchProps;

export const UserProfileComponent = (
  props: CombinedUserProfileProps
): React.ReactElement => {
  const [getMenuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const closeMenu = (): void => setMenuAnchor(null);
  const logout = (): void => {
    closeMenu();
    props.signOut();
  };

  const classes = useStyles();

  return (
    <div className="tour-user-profile">
      {props.loggedIn ? (
        <div>
          {props.user.avatarUrl !== '' ? (
            <Avatar
              className={classes.avatar}
              alt="user"
              src={props.user.avatarUrl}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              aria-label="Open user menu"
            />
          ) : (
            <IconButton
              className={classes.userButton}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              aria-label="Open user menu"
              size="large"
            >
              <AccountCircleIcon />
            </IconButton>
          )}
          <Menu
            id="simple-menu"
            anchorEl={getMenuAnchor}
            open={getMenuAnchor !== null}
            onClose={closeMenu}
          >
            <div className={classes.usernameContainer}>
              <Typography>Signed in as:</Typography>
              <Typography className={classes.username}>
                {props.user.username}
              </Typography>
            </div>
            <Divider />
            <MenuItem id="item-sign-out" onClick={logout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary={getString(props.res, 'logout-button')} />
            </MenuItem>
          </Menu>
        </div>
      ) : (
        <Button
          color="primary"
          variant="contained"
          className={classes.signInButton}
          onClick={() => {
            props.signIn();
            log.debug('signing in');
          }}
        >
          <Typography
            color="inherit"
            noWrap
            style={{ fontWeight: 500, marginTop: 3 }}
          >
            {getString(props.res, 'login-button')}
          </Typography>
        </Button>
      )}
    </div>
  );
};

const mapStateToProps = (state: StateType): UserProfileProps => ({
  loggedIn:
    state.scigateway.authorisation.provider.isLoggedIn() &&
    !(
      state.scigateway.authorisation.provider.autoLogin &&
      localStorage.getItem('autoLogin') === 'true'
    ),
  user:
    state.scigateway.authorisation.provider.user || new UserInfo('anonymous'),
  res: getAppStrings(state, 'login'),
});

const mapDispatchToProps = (dispatch: Dispatch): UserProfileDispatchProps => ({
  signIn: () => dispatch(push('/login')),
  signOut: () => {
    const thunkDispatch = dispatch as ThunkDispatch<StateType, null, AnyAction>;
    thunkDispatch(signOut());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserProfileComponent);
