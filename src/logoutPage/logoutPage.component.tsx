import React from 'react';
import { signOut } from '../state/actions/scigateway.actions';
import Button from '@mui/material/Button';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { push } from 'connected-react-router';
import Typography from '@mui/material/Typography';
import { ThunkDispatch } from 'redux-thunk';
import { Dispatch, Action, AnyAction } from 'redux';
import { Theme } from '@mui/material/styles';
import { connect } from 'react-redux';
import { AppStrings } from '../state/scigateway.types';
import { StateType, User } from '../state/state.types';
import { getAppStrings, getString } from '../state/strings';
import UserInfo from '../authentication/user';
import { Avatar, Paper, styled } from '@mui/material';

const InfoTypography = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  color: theme.palette.secondary.main,
}));

interface LogoutPageProps {
  user: User;
  res: AppStrings | undefined;
}

interface LogoutPageDispatchProps {
  signIn: () => Action;
  signOut: () => void;
}

export type CombinedLogoutPageProps = LogoutPageProps & LogoutPageDispatchProps;

export const UnconnectedLogoutPage = (
  props: CombinedLogoutPageProps
): React.ReactElement => {
  const logout = (): void => {
    props.signOut();
  };

  return (
    <div className="logout-page">
      <Paper
        sx={(theme: Theme) => ({
          marginTop: theme.spacing(8),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: theme.spacing(3),
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
          sx={{ paddingTop: '3px', fontWeight: 'bold', fontSize: 17 }}
        >
          {props.user.username}
        </Typography>
        <InfoTypography>
          {getString(props.res, 'logout-message')}
        </InfoTypography>
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: 1 }}
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
)(UnconnectedLogoutPage);
