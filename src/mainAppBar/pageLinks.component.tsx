import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminRoutes } from '../routing/routing.component';
import { StateType } from '../state/state.types';
import { getAppStrings, getString } from '../state/strings';
import { appBarIconButtonStyle } from './styles';

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

  const plugins = useSelector((state: StateType) => state.scigateway.plugins);
  const adminRoutes = getAdminRoutes({ plugins });

  const res = useSelector((state: StateType) =>
    getAppStrings(state, 'main-appbar')
  );

  const dispatch = useDispatch();

  function navigateToHelpPage(): void {
    dispatch(push('/help'));
  }

  function navigateToAdminPage(): void {
    const targetRoute =
      adminPageDefaultTab &&
      Object.prototype.hasOwnProperty.call(adminRoutes, adminPageDefaultTab)
        ? adminRoutes[adminPageDefaultTab]
        : adminRoutes['maintenance'];

    dispatch(push(targetRoute));
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
