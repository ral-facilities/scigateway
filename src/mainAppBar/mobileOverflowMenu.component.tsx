import {
  Divider,
  ListItemText,
  Menu,
  MenuItem,
  MenuProps,
} from '@mui/material';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import { toggleHelp } from '../state/actions/scigateway.actions';
import { adminRoutes } from '../state/scigateway.types';
import { StateType } from '../state/state.types';
import { getAppStrings, getString } from '../state/strings';
import { SettingsMenuContent } from './settingsMenu.component';

interface MobileOverflowMenuProps extends MenuProps {
  onClose: () => void;
}

const MENU_ID = 'mobile-overflow-menu';

function MobileOverflowMenu({
  onClose,
  ...props
}: MobileOverflowMenuProps): JSX.Element {
  const res = useSelector((state: StateType) =>
    getAppStrings(state, 'main-appbar')
  );
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

  const dispatch = useDispatch();

  function navigateToHelpPage(): void {
    dispatch(push('/help'));
  }

  function navigateToAdminPage(): void {
    dispatch(push(adminRoutes[adminPageDefaultTab ?? 'maintenance']));
  }

  function toggleTutorial(): void {
    onClose();
    dispatch(toggleHelp());
  }

  return (
    <Menu id={MENU_ID} onClose={onClose} {...props}>
      {shouldShowAdminPageButton && (
        <MenuItem onClick={navigateToAdminPage}>
          <ListItemText>{getString(res, 'admin-page')}</ListItemText>
        </MenuItem>
      )}
      {shouldShowHelpPageButton && (
        <MenuItem onClick={navigateToHelpPage}>
          <ListItemText>{getString(res, 'help-page')}</ListItemText>
        </MenuItem>
      )}
      <MenuItem onClick={toggleTutorial}>
        <ListItemText>{getString(res, 'tutorial')}</ListItemText>
      </MenuItem>
      <Divider />
      <SettingsMenuContent onRequestCloseParentMenu={onClose} />
    </Menu>
  );
}

MobileOverflowMenu.ID = MENU_ID;

export default MobileOverflowMenu;
