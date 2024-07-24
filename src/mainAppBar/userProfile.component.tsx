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

interface UserProfileProps {
  loggedIn: boolean;
  user: User;
  res: AppStrings | undefined;
}

interface UserProfileDispatchProps {
  signIn: () => Action;
  signOut: () => void;
}

type CombinedUserProfileProps = UserProfileProps & UserProfileDispatchProps;

export const UserProfileComponent = (
  props: CombinedUserProfileProps
): React.ReactElement => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);
  const closeMenu = (): void => setMenuAnchor(null);
  const logout = (): void => {
    closeMenu();
    props.signOut();
  };
  const open = Boolean(menuAnchor);

  return (
    <div className="tour-user-profile">
      {props.loggedIn ? (
        <div>
          <IconButton
            sx={{ margin: 1, color: 'primary.contrastText' }}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            aria-label="Open user menu"
            aria-controls={open ? 'simple-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            size={props.user.avatarUrl ? 'small' : 'large'}
          >
            {props.user.avatarUrl !== '' ? (
              <Avatar alt="user" src={props.user.avatarUrl} />
            ) : (
              <AccountCircleIcon />
            )}
          </IconButton>

          <Menu
            id="simple-menu"
            anchorEl={menuAnchor}
            open={open}
            onClose={closeMenu}
          >
            <div
              style={{
                paddingTop: '8px',
                paddingBottom: '8px',
                paddingLeft: '15px',
                paddingRight: '15px',
              }}
            >
              <Typography>Signed in as:</Typography>
              <Typography
                sx={{ paddingTop: '3px', fontWeight: 'bold', fontSize: '17px' }}
              >
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
          sx={(theme: Theme) => ({
            margin: 1,
            color: '#FFF',
            backgroundColor: theme.colours.lightBlue,
            '&:hover': {
              backgroundColor: alpha(theme.colours.lightBlue, 0.8),
            },
          })}
          onClick={() => {
            props.signIn();
            log.debug('signing in');
          }}
        >
          <Typography
            color="inherit"
            noWrap
            sx={{ fontWeight: 500, marginTop: '3px' }}
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
