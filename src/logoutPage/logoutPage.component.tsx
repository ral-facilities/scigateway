import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Avatar, Paper } from '@mui/material';
import Button from '@mui/material/Button';
import { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import UserInfo from '../authentication/user';
import { signOut } from '../state/actions/scigateway.actions';
import { AppStrings } from '../state/scigateway.types';
import { StateType, User } from '../state/state.types';
import { getAppStrings, getString } from '../state/strings';

interface LogoutPageProps {
  user: User;
  res: AppStrings | undefined;
}

type CombinedLogoutPageProps = LogoutPageProps;

const UnconnectedLogoutPage = (
  props: CombinedLogoutPageProps
): React.ReactElement => {
  const dispatch = useDispatch();
  const history = useHistory();
  const logout = (): void => {
    const thunkDispatch = dispatch as ThunkDispatch<StateType, null, AnyAction>;
    thunkDispatch(signOut(history));
  };

  return (
    <div className="logout-page">
      <Paper
        sx={(theme: Theme) => ({
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 3,
          [theme.breakpoints.up(
            400 + parseInt(theme.spacing(6).replace('px', ''))
          )]: {
            width: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
          },
        })}
      >
        {props.user.avatarUrl !== '' ? (
          <Avatar sx={{ margin: 1 }} alt="user" src={props.user.avatarUrl} />
        ) : (
          <Avatar
            sx={{
              margin: 1,
              backgroundColor: (theme: Theme) => theme.colours.lightBlue,
              color: '#FFFFFF',
            }}
          >
            <AccountCircleIcon />
          </Avatar>
        )}

        <Typography sx={{ marginTop: 1 }}>
          {getString(props.res, 'username-description')}
        </Typography>
        <Typography
          sx={{ paddingTop: '3px', fontWeight: 'bold', fontSize: '17px' }}
        >
          {props.user.username}
        </Typography>
        <Typography sx={{ marginTop: 1, color: 'secondary.main' }}>
          {getString(props.res, 'logout-message')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: 1 }}
          onClick={logout}
          data-test-id="logout-page-button"
        >
          <Typography color="inherit" noWrap sx={{ marginTop: '3px' }}>
            {getString(props.res, 'logout-button')}
          </Typography>
        </Button>
      </Paper>
    </div>
  );
};

const mapStateToProps = (state: StateType): LogoutPageProps => ({
  user:
    state.scigateway.authorisation.provider.user || new UserInfo('anonymous'),
  res: getAppStrings(state, 'login'),
});

export default connect(mapStateToProps)(UnconnectedLogoutPage);
