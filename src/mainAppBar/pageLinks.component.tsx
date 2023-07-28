import { useDispatch, useSelector } from 'react-redux';
import { StateType } from '../state/state.types';
import Button from '@mui/material/Button';
import { getAppStrings, getString } from '../state/strings';
import Typography from '@mui/material/Typography';
import React from 'react';
import { appBarIconButtonStyle } from './styles';
import { push } from 'connected-react-router';
import { adminRoutes } from '../state/scigateway.types';

function PageLinks(): JSX.Element {
  const shouldShowHelpPageButton = useSelector(
    (state: StateType) => state.scigateway.features.showHelpPageButton
  );
  const shouldShowAdminPageButton = useSelector(
    (state: StateType) =>
      state.scigateway.authorisation.provider.isLoggedIn() &&
      state.scigateway.authorisation.provider.isAdmin()
  );
  const adminPageDefaultTab = useSelector(
    (state: StateType) => state.scigateway.adminPageDefaultTab
  );
  const res = useSelector((state: StateType) =>
    getAppStrings(state, 'main-appbar')
  );

  const dispatch = useDispatch();

  function navigateToHelpPage(): void {
    dispatch(push('/help'));
  }

  function navigateToAdminPage(): void {
    dispatch(push(adminRoutes[adminPageDefaultTab ?? 'maintenance']));
  }

  return (
    <>
      {shouldShowHelpPageButton ? (
        <Button
          className="tour-help"
          sx={appBarIconButtonStyle}
          onClick={navigateToHelpPage}
          aria-label={getString(res, 'help-page')}
        >
          <Typography
            color="inherit"
            noWrap
            sx={{ fontWeight: 500, marginTop: '3px' }}
          >
            {getString(res, 'help')}
          </Typography>
        </Button>
      ) : null}
      {shouldShowAdminPageButton ? (
        <Button
          className="tour-admin"
          sx={appBarIconButtonStyle}
          onClick={navigateToAdminPage}
          aria-label={getString(res, 'admin-page')}
        >
          <Typography
            color="inherit"
            noWrap
            sx={{ fontWeight: 500, marginTop: '3px' }}
          >
            {getString(res, 'admin')}
          </Typography>
        </Button>
      ) : null}
    </>
  );
}

export default PageLinks;
