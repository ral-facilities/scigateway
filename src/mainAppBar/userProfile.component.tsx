import React, { useState } from 'react';
import { Dispatch, Action, AnyAction } from 'redux';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import {
  IconButton,
  withStyles,
  Theme,
  createStyles,
  Menu,
  MenuItem,
  WithStyles,
  Button,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@material-ui/core';
import { StyleRules, fade } from '@material-ui/core/styles';
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

const styles = (theme: Theme): StyleRules =>
  createStyles({
    button: {
      margin: theme.spacing(1),
      color: theme.palette.primary.contrastText,
      backgroundColor: (theme as UKRITheme).colours.lightBlue,
      '&:hover': {
        backgroundColor: fade(
          (theme as UKRITheme).colours.lightBlue,
          theme.palette.action.hoverOpacity
        ),
      },
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
  });

type CombinedUserProfileProps = UserProfileProps &
  UserProfileDispatchProps &
  WithStyles<typeof styles>;

const UserProfileComponent = (
  props: CombinedUserProfileProps
): React.ReactElement => {
  const [getMenuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const closeMenu = (): void => setMenuAnchor(null);
  const logout = (): void => {
    closeMenu();
    props.signOut();
  };
  return (
    <div className="tour-user-profile">
      {props.loggedIn ? (
        <div>
          {props.user.avatarUrl !== '' ? (
            <Avatar
              className={props.classes.avatar}
              alt="user"
              src={props.user.avatarUrl}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              aria-label="Open user menu"
            />
          ) : (
            <IconButton
              className={props.classes.button}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              aria-label="Open user menu"
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
            <div className={props.classes.usernameContainer}>
              <Typography>Signed in as:</Typography>
              <Typography className={props.classes.username}>
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
          className={props.classes.button}
          onClick={() => {
            props.signIn();
            log.debug('signing in');
          }}
        >
          <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
            {getString(props.res, 'login-button')}
          </Typography>
        </Button>
      )}
    </div>
  );
};

export const UserProfileComponentWithStyles = withStyles(styles)(
  UserProfileComponent
);

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
)(UserProfileComponentWithStyles);
