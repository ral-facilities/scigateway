import BrightnessIcon from '@mui/icons-material/Brightness4';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import TuneIcon from '@mui/icons-material/Tune';
import {
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuProps,
} from '@mui/material';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadDarkModePreference,
  loadHighContrastModePreference,
} from '../state/actions/scigateway.actions';
import { StateType } from '../state/state.types';
import { getAppStrings, getString } from '../state/strings';

interface SettingsMenuProps extends MenuProps {
  onClose: () => void;
}

const MENU_ID = 'settings';

function SettingsMenu({ onClose, ...props }: SettingsMenuProps): JSX.Element {
  return (
    <Menu id={MENU_ID} onClose={onClose} {...props}>
      <SettingsMenuContent
        onRequestCloseParentMenu={() => onClose && onClose()}
      />
    </Menu>
  );
}

SettingsMenu.ID = MENU_ID;

interface SettingsMenuContentProps {
  onRequestCloseParentMenu: () => void;
}

function SettingsMenuContent({
  onRequestCloseParentMenu,
}: SettingsMenuContentProps): JSX.Element {
  const isDarkMode = useSelector(
    (state: StateType) => state.scigateway.darkMode
  );
  const isHighContrastMode = useSelector(
    (state: StateType) => state.scigateway.highContrastMode
  );
  const res = useSelector((state: StateType) =>
    getAppStrings(state, 'main-appbar')
  );
  const dispatch = useDispatch();

  function manageCookies(): void {
    onRequestCloseParentMenu();
    dispatch(push('/cookies'));
  }

  function toggleDarkMode(): void {
    const toggledPreference = !isDarkMode;
    localStorage.setItem('darkMode', toggledPreference.toString());
    dispatch(loadDarkModePreference(toggledPreference));
  }

  function toggleHighContrastMode(): void {
    const toggledPreference = !isHighContrastMode;
    localStorage.setItem('highContrastMode', toggledPreference.toString());
    dispatch(loadHighContrastModePreference(toggledPreference));
  }

  return (
    <>
      <MenuItem id="item-manage-cookies" onClick={manageCookies}>
        <ListItemIcon>
          <TuneIcon />
        </ListItemIcon>
        <ListItemText primary={getString(res, 'manage-cookies-button')} />
      </MenuItem>
      <MenuItem id="item-dark-mode" onClick={toggleDarkMode}>
        <ListItemIcon>
          <BrightnessIcon />
        </ListItemIcon>
        <ListItemText
          primary={
            isDarkMode
              ? getString(res, 'switch-light-mode')
              : getString(res, 'switch-dark-mode')
          }
        />
      </MenuItem>
      <MenuItem id="item-high-contrast-mode" onClick={toggleHighContrastMode}>
        <ListItemIcon>
          <InvertColorsIcon />
        </ListItemIcon>
        <ListItemText
          primary={
            isHighContrastMode
              ? getString(res, 'switch-high-contrast-off')
              : getString(res, 'switch-high-contrast-on')
          }
        />
      </MenuItem>
    </>
  );
}

export default SettingsMenu;
export { SettingsMenuContent };
