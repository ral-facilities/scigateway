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
import { StyleRules } from '@material-ui/core/styles';
import { StateType } from '../state/state.types';
import { getAppStrings, getString } from '../state/strings';
import { signOut } from '../state/actions/daaas.actions';
import { connect } from 'react-redux';
import { AppStrings } from '../state/daaas.types';
import { ThunkDispatch } from 'redux-thunk';
import { push } from 'connected-react-router';
import log from 'loglevel';

interface UserProfileProps {
  loggedIn: boolean;
  username: string;
  avatar: string;
  res: AppStrings | undefined;
}

interface UserProfileDispatchProps {
  signIn: () => Action;
  signOut: () => void;
}

const styles = (theme: Theme): StyleRules =>
  createStyles({
    button: {
      margin: theme.spacing.unit,
      color: theme.palette.primary.contrastText,
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
    },
    avatar: {
      margin: theme.spacing.unit,
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
    <div>
      {props.loggedIn ? (
        <div>
          {props.avatar !== '' ? (
            <Avatar
              className={props.classes.avatar}
              alt="user"
              src={props.avatar}
              onClick={e => setMenuAnchor(e.currentTarget)}
            />
          ) : (
            <IconButton
              className={props.classes.button}
              onClick={e => setMenuAnchor(e.currentTarget)}
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
                {props.username}
              </Typography>
            </div>
            <Divider />
            <MenuItem onClick={logout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                inset
                primary={getString(props.res, 'logout-button')}
              />
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
  loggedIn: state.daaas.authorisation.provider.isLoggedIn(),
  username: state.daaas.authorisation.provider.user
    ? state.daaas.authorisation.provider.user.username
    : 'anonymous',
  avatar: state.daaas.authorisation.provider.user
    ? state.daaas.authorisation.provider.user.avatarUrl
    : '',
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
