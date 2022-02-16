import React, { useState } from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import HelpIcon from '@material-ui/icons/HelpOutline';
import MenuIcon from '@material-ui/icons/Menu';
import BrightnessIcon from '@material-ui/icons/Brightness4';
import InvertColorsIcon from '@material-ui/icons/InvertColors';
import TuneIcon from '@material-ui/icons/Tune';
import SettingsIcon from '@material-ui/icons/Settings';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import {
  withStyles,
  createStyles,
  Theme,
  StyleRules,
  WithStyles,
} from '@material-ui/core/styles';
import classNames from 'classnames';
import ScigatewayLogo from '../images/scigateway-white-text-blue-mark-logo.svg';
import {
  toggleDrawer,
  toggleHelp,
  loadDarkModePreference,
  loadHighContrastModePreference,
} from '../state/actions/scigateway.actions';
import { AppStrings } from '../state/scigateway.types';
import { StateType } from '../state/state.types';
import { push } from 'connected-react-router';
import { getAppStrings, getString } from '../state/strings';
//import { UKRITheme } from '../theming';
import UserProfileComponent from './userProfile.component';
import NotificationBadgeComponent from '../notifications/notificationBadge.component';
import { PluginConfig } from '../state/scigateway.types';
import { useLocation } from 'react-router-dom';
import { UKRITheme } from '../theming';

interface MainAppProps {
  drawerOpen: boolean;
  res: AppStrings | undefined;
  showHelpPageButton: boolean;
  showAdminPageButton: boolean;
  singlePluginLogo: boolean;
  loggedIn: boolean;
  darkMode: boolean;
  highContrastMode: boolean;
  plugins?: PluginConfig[];
  loading: boolean;
  logo?: string;
  homepageUrl?: string;
}

interface MainAppDispatchProps {
  toggleDrawer: () => Action;
  navigateToHome: () => Action;
  navigateToHelpPage: () => Action;
  navigateToAdminPage: () => Action;
  toggleHelp: () => Action;
  manageCookies: () => Action;
  toggleDarkMode: (preference: boolean) => Action;
  toggleHighContrastMode: (preference: boolean) => Action;
}

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      width: '100%',
    },
    appBar: {
      backgroundColor: theme.palette.primary.main,
      height: (theme as UKRITheme).mainAppBarHeight,
    },
    grow: {
      flexGrow: 1,
    },
    titleButton: {
      padding: 4,
      display: 'contents',
      margin: theme.spacing(1),
      '& img': {
        height: 24,
      },
    },
    button: {
      margin: theme.spacing(1),
      color: theme.palette.primary.contrastText,
    },
    menuButton: {
      marginLeft: -12,
      marginRight: 0,
      color: theme.palette.primary.contrastText,
    },
    menuButtonPlaceholder: {
      marginLeft: -12,
      marginRight: 0,
      width: 48,
    },
    menuButtonOpen: {
      marginLeft: -12,
      marginRight: 0,
      color: theme.palette.primary.contrastText,
    },
  });

type CombinedMainAppBarProps = MainAppProps &
  MainAppDispatchProps &
  WithStyles<typeof styles>;

const MainAppBar = (props: CombinedMainAppBarProps): React.ReactElement => {
  const [getMenuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [defaultLogo, setLogo] = useState<string>(ScigatewayLogo);
  const closeMenu = (): void => setMenuAnchor(null);
  const manageCookies = (): void => {
    closeMenu();
    props.manageCookies();
  };
  const toggleDarkMode = (): void => {
    const toggledPreference = !props.darkMode;
    localStorage.setItem('darkMode', toggledPreference.toString());
    props.toggleDarkMode(toggledPreference);
  };

  const toggleHighContrastMode = (): void => {
    const toggledPreference = !props.highContrastMode;
    localStorage.setItem('highContrastMode', toggledPreference.toString());
    props.toggleHighContrastMode(toggledPreference);
  };

  const location = useLocation();

  React.useEffect(() => {
    if (!props.loading) {
      let set = false;
      if (props.plugins && props.plugins.length >= 1) {
        //Use the first plugin's logo for everything if 'singlePluginLogo' is true, otherwise choose depending on current plugin visible
        if (props.singlePluginLogo) {
          setLogo(props.plugins[0].logoDarkMode ?? ScigatewayLogo);
          set = true;
        } else {
          for (let i = 0; i < props.plugins.length; i++) {
            if (document.getElementById(props.plugins[i].plugin) !== null) {
              setLogo(props.plugins[i].logoDarkMode ?? ScigatewayLogo);
              set = true;
              break;
            }
          }
        }
      }

      if (!set || !props.plugins) {
        setLogo(ScigatewayLogo);
      }
    }
  }, [props.plugins, location, props.loading, props.singlePluginLogo]);

  React.useEffect(() => {
    if (!props.loading && props.loggedIn && !props.drawerOpen)
      props.toggleDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.loading, props.loggedIn]);

  return (
    <div className={props.classes.root}>
      <AppBar position="static" className={props.classes.appBar}>
        <Toolbar
          disableGutters
          style={{ marginLeft: '16px', marginRight: '16px' }}
        >
          {props.loggedIn ? (
            props.drawerOpen === false ? (
              <IconButton
                className={classNames(
                  props.classes.menuButton,
                  props.drawerOpen && props.classes.menuButtonOpen
                )}
                color="inherit"
                onClick={props.toggleDrawer}
                aria-label={getString(props.res, 'open-navigation-menu')}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <IconButton
                className={classNames(
                  props.classes.menuButtonOpen,
                  props.drawerOpen && props.classes.menuButton,
                  'tour-nav-menu'
                )}
                color="inherit"
                onClick={props.toggleDrawer}
                aria-label={getString(props.res, 'close-navigation-menu')}
              >
                <MenuOpenIcon />
              </IconButton>
            )
          ) : (
            <div className={props.classes.menuButtonPlaceholder} />
          )}
          <Button
            className={classNames(props.classes.titleButton, 'tour-title')}
            onClick={props.navigateToHome}
            aria-label={getString(props.res, 'home-page')}
          >
            <img
              src={props.logo ? props.logo : defaultLogo}
              alt={getString(props.res, 'title')}
            />
          </Button>

          {props.showHelpPageButton ? (
            <Button
              className={classNames(props.classes.button, 'tour-help')}
              onClick={props.navigateToHelpPage}
              aria-label={getString(props.res, 'help-page')}
            >
              <Typography
                color="inherit"
                noWrap
                style={{ fontWeight: 500, marginTop: 3 }}
              >
                {getString(props.res, 'help')}
              </Typography>
            </Button>
          ) : null}
          {props.showAdminPageButton ? (
            <Button
              className={classNames(props.classes.button, 'tour-admin')}
              onClick={props.navigateToAdminPage}
              aria-label={getString(props.res, 'admin-page')}
            >
              <Typography
                color="inherit"
                noWrap
                style={{ fontWeight: 500, marginTop: 3 }}
              >
                {getString(props.res, 'admin')}
              </Typography>
            </Button>
          ) : null}
          <div className={props.classes.grow} />
          <IconButton
            className={props.classes.button}
            onClick={props.toggleHelp}
            aria-label={getString(props.res, 'help')}
          >
            <HelpIcon />
          </IconButton>
          <IconButton
            className={classNames(props.classes.button, 'tour-settings')}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            aria-label={getString(props.res, 'open-browser-settings')}
          >
            <SettingsIcon />
          </IconButton>
          <Menu
            id="settings"
            anchorEl={getMenuAnchor}
            open={getMenuAnchor !== null}
            onClose={closeMenu}
          >
            <MenuItem id="item-manage-cookies" onClick={manageCookies}>
              <ListItemIcon>
                <TuneIcon />
              </ListItemIcon>
              <ListItemText
                primary={getString(props.res, 'manage-cookies-button')}
              />
            </MenuItem>
            <MenuItem id="item-dark-mode" onClick={toggleDarkMode}>
              <ListItemIcon>
                <BrightnessIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  props.darkMode
                    ? getString(props.res, 'switch-light-mode')
                    : getString(props.res, 'switch-dark-mode')
                }
              />
            </MenuItem>
            <MenuItem
              id="item-high-contrast-mode"
              onClick={toggleHighContrastMode}
            >
              <ListItemIcon>
                <InvertColorsIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  props.highContrastMode
                    ? getString(props.res, 'switch-high-contrast-off')
                    : getString(props.res, 'switch-high-contrast-on')
                }
              />
            </MenuItem>
          </Menu>
          {props.loggedIn ? <NotificationBadgeComponent /> : null}
          <UserProfileComponent />
        </Toolbar>
      </AppBar>
    </div>
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
  res: getAppStrings(state, 'main-appbar'),
  darkMode: state.scigateway.darkMode,
  highContrastMode: state.scigateway.highContrastMode,
  plugins: state.scigateway.plugins,
  loading: state.scigateway.siteLoading,
  logo: state.scigateway.logo,
  homepageUrl: state.scigateway.homepageUrl,
});

const mapDispatchToProps = (dispatch: Dispatch): MainAppDispatchProps => ({
  toggleDrawer: () => dispatch(toggleDrawer()),
  navigateToHome: () => dispatch(push('/')),
  navigateToHelpPage: () => dispatch(push('/help')),
  navigateToAdminPage: () => dispatch(push('/admin')),
  toggleHelp: () => dispatch(toggleHelp()),
  manageCookies: () => dispatch(push('/cookies')),
  toggleDarkMode: (preference: boolean) =>
    dispatch(loadDarkModePreference(preference)),
  toggleHighContrastMode: (preference: boolean) =>
    dispatch(loadHighContrastModePreference(preference)),
});

export const MainAppBarWithStyles = withStyles(styles)(MainAppBar);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainAppBarWithStyles);
