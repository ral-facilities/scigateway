import HelpIcon from '@mui/icons-material/HelpOutline';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, styled, useMediaQuery } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import { Theme, useTheme } from '@mui/material/styles';
import { push } from 'connected-react-router';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Action, Dispatch } from 'redux';
import NullAuthProvider from '../authentication/nullAuthProvider';
import ScigatewayLogo from '../images/scigateway-white-text-blue-mark-logo.svg';
import NotificationBadgeComponent from '../notifications/notificationBadge.component';
import {
  loadDarkModePreference,
  loadHighContrastModePreference,
  toggleDrawer,
  toggleHelp,
} from '../state/actions/scigateway.actions';
import { buildNavDrawerPluginList } from '../state/pluginhelper';
import { AppStrings, PluginConfig } from '../state/scigateway.types';
import { StateType } from '../state/state.types';
import { getAppStrings, getString } from '../state/strings';
import MobileOverflowMenu from './mobileOverflowMenu.component';
import PageLinks from './pageLinks.component';
import SettingsMenu from './settingsMenu.component';
import { appBarIconButtonStyle, appBarMenuItemIconStyle } from './styles';
import UserProfileComponent from './userProfile.component';

interface MainAppProps {
  drawerOpen: boolean;
  res: AppStrings | undefined;
  showHelpPageButton: boolean;
  showAdminPageButton: boolean;
  showUserComponent: boolean;
  singlePluginLogo: boolean;
  loggedIn: boolean;
  darkMode: boolean;
  highContrastMode: boolean;
  plugins: PluginConfig[];
  loading: boolean;
  logo?: string;
  homepageUrl?: string;
  adminPageDefaultTab?: string;
  pathname: string;
}

interface MainAppDispatchProps {
  toggleDrawer: () => Action;
  navigateToHome: () => Action;
  navigateToHelpPage: () => Action;
  navigateToAdminPage: (defaultTab: string) => Action;
  toggleHelp: () => Action;
  manageCookies: () => Action;
  toggleDarkMode: (preference: boolean) => Action;
  toggleHighContrastMode: (preference: boolean) => Action;
}

const TitleButton = styled(Button)(({ theme }) => ({
  padding: '4px',
  margin: 1,
  '& img': {
    // logo maxHeight = mainAppBar height - 2 * padding - 2 * margin
    maxHeight: `calc(${theme.mainAppBarHeight} - 2 * 4px - 2 * ${theme.spacing(
      1
    )}px)`,
  },
}));

type CombinedMainAppBarProps = MainAppProps & MainAppDispatchProps;

const getPluginLogo = (
  plugin: PluginConfig,
  useLightBackgroundLogo: boolean
): string | undefined =>
  useLightBackgroundLogo
    ? (plugin.logoLightMode ?? plugin.logoDarkMode)
    : (plugin.logoDarkMode ?? plugin.logoLightMode);

export const MainAppBar = (
  props: CombinedMainAppBarProps
): React.ReactElement => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [defaultLogo, setLogo] = useState<string>(ScigatewayLogo);
  const closeMenu = (): void => setMenuAnchor(null);
  const settingsMenuOpen = Boolean(menuAnchor);
  const location = useLocation();
  const theme = useTheme();
  const isViewportMdOrLarger = useMediaQuery(theme.breakpoints.up('md'));
  // Dark high-contrast mode uses a light app bar background.
  const useLightBackgroundLogo = props.darkMode && props.highContrastMode;

  React.useEffect(() => {
    if (!props.loading) {
      let set = false;
      if (props.plugins.length >= 1) {
        //Use the first plugin's logo for everything if 'singlePluginLogo' is true, otherwise choose depending on current plugin visible
        if (props.singlePluginLogo) {
          setLogo(
            getPluginLogo(props.plugins[0], useLightBackgroundLogo) ??
              ScigatewayLogo
          );
          set = true;
        } else {
          for (const p of props.plugins) {
            if (document.getElementById(p.plugin) !== null) {
              setLogo(
                getPluginLogo(p, useLightBackgroundLogo) ?? ScigatewayLogo
              );
              set = true;
              break;
            }
          }
        }
      }

      if (!set) {
        setLogo(ScigatewayLogo);
      }
    }
  }, [
    props.plugins,
    location,
    props.loading,
    props.singlePluginLogo,
    useLightBackgroundLogo,
  ]);

  const { toggleDrawer } = props;

  const pluginList = React.useMemo(
    () => buildNavDrawerPluginList(props.plugins, props.homepageUrl),
    [props.plugins, props.homepageUrl]
  );

  React.useEffect(() => {
    if (!props.loading && pluginList.length === 0 && props.drawerOpen) {
      // don't show drawer
      toggleDrawer();
    }
  }, [props.loading, props.drawerOpen, toggleDrawer, pluginList]);

  // have menu open by default after page loads
  React.useEffect(() => {
    if (!props.loading && !props.drawerOpen && isViewportMdOrLarger) {
      toggleDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.loading, isViewportMdOrLarger]);

  // close menu when viewport changes between mobile and non-mobile viewport
  // to prevent the wrong type of menu lingering
  //
  // for example, when the normal settings menu is visible, and the viewport size changes to mobile,
  // it should be closed because the mobile overflow menu is used instead.
  React.useEffect(() => {
    setMenuAnchor(null);
  }, [isViewportMdOrLarger]);

  return (
    <Box
      sx={{
        width: '100%',
        '@media print': {
          display: 'none',
        },
      }}
    >
      <AppBar
        position="static"
        color="transparent"
        sx={(theme: Theme) => ({
          backgroundColor: theme.palette.primary.main,
          height: theme.mainAppBarHeight,
        })}
      >
        <Toolbar
          disableGutters
          sx={{
            marginLeft: '16px',
            marginRight: isViewportMdOrLarger ? '16px' : 0,
          }}
        >
          {pluginList.length === 0 ? null : !props.drawerOpen ? (
            <IconButton
              sx={appBarMenuItemIconStyle}
              color="inherit"
              onClick={toggleDrawer}
              aria-label={getString(props.res, 'open-navigation-menu')}
              size="large"
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <IconButton
              sx={appBarMenuItemIconStyle}
              color="inherit"
              onClick={toggleDrawer}
              aria-label={getString(props.res, 'close-navigation-menu')}
              size="large"
            >
              <MenuOpenIcon />
            </IconButton>
          )}

          <TitleButton
            className="tour-title"
            onClick={props.navigateToHome}
            aria-label={getString(props.res, 'home-page')}
          >
            <img
              src={props.logo ? props.logo : defaultLogo}
              // if using default logo use 24px, if using custom logo then don't set height
              // custom logos must be sized to fit or will default to the max-height set in the top styling
              style={props.logo ? {} : { height: '24px' }}
              alt={getString(props.res, 'title')}
            />
          </TitleButton>

          {isViewportMdOrLarger && <PageLinks />}
          <div style={{ flexGrow: 1 }} />
          {isViewportMdOrLarger && (
            <>
              <IconButton
                sx={appBarIconButtonStyle}
                onClick={props.toggleHelp}
                aria-label={getString(props.res, 'help')}
                size="large"
              >
                <HelpIcon />
              </IconButton>
              <IconButton
                className={'tour-settings'}
                sx={appBarIconButtonStyle}
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                aria-label={getString(props.res, 'open-browser-settings')}
                aria-controls={settingsMenuOpen ? SettingsMenu.ID : undefined}
                aria-haspopup="true"
                aria-expanded={settingsMenuOpen ? 'true' : undefined}
                size="large"
              >
                <SettingsIcon />
              </IconButton>
            </>
          )}

          {props.loggedIn && <NotificationBadgeComponent />}
          {props.showUserComponent && <UserProfileComponent />}

          {!isViewportMdOrLarger && (
            <IconButton
              sx={appBarIconButtonStyle}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              aria-label={getString(props.res, 'open-mobile-menu')}
              aria-controls={
                settingsMenuOpen ? MobileOverflowMenu.ID : undefined
              }
              aria-haspopup="true"
              aria-expanded={settingsMenuOpen ? 'true' : undefined}
              size="large"
            >
              <MoreVertIcon />
            </IconButton>
          )}

          {isViewportMdOrLarger ? (
            <SettingsMenu
              open={settingsMenuOpen}
              anchorEl={menuAnchor}
              onClose={closeMenu}
            />
          ) : (
            <MobileOverflowMenu
              open={settingsMenuOpen}
              anchorEl={menuAnchor}
              onClose={closeMenu}
            />
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

const mapStateToProps = (state: StateType): MainAppProps => ({
  drawerOpen: state.scigateway.drawerOpen,
  showHelpPageButton: state.scigateway.features.showHelpPageButton,
  singlePluginLogo: state.scigateway.features.singlePluginLogo,
  loggedIn: state.scigateway.authorisation.provider.isLoggedIn(),
  showAdminPageButton:
    state.scigateway.authorisation.provider.isLoggedIn() &&
    state.scigateway.authorisation.provider.isAdmin(),
  showUserComponent: !(
    state.scigateway.authorisation.provider instanceof NullAuthProvider
  ),
  res: getAppStrings(state, 'main-appbar'),
  darkMode: state.scigateway.darkMode,
  highContrastMode: state.scigateway.highContrastMode,
  plugins: state.scigateway.plugins,
  loading: state.scigateway.siteLoading,
  logo: state.scigateway.logo,
  homepageUrl: state.scigateway.homepageUrl,
  adminPageDefaultTab: state.scigateway.adminPageDefaultTab,
  pathname: state.router.location.pathname,
});

const mapDispatchToProps = (dispatch: Dispatch): MainAppDispatchProps => ({
  toggleDrawer: () => dispatch(toggleDrawer()),
  navigateToHome: () => dispatch(push('/')),
  navigateToHelpPage: () => dispatch(push('/help')),
  navigateToAdminPage: (defaultTab: string) => dispatch(push(defaultTab)),
  toggleHelp: () => dispatch(toggleHelp()),
  manageCookies: () => dispatch(push('/cookies')),
  toggleDarkMode: (preference: boolean) =>
    dispatch(loadDarkModePreference(preference)),
  toggleHighContrastMode: (preference: boolean) =>
    dispatch(loadHighContrastModePreference(preference)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MainAppBar);
