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
import TuneIcon from '@material-ui/icons/Tune';
import SettingsIcon from '@material-ui/icons/Settings';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';
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
} from '../state/actions/scigateway.actions';
import { AppStrings } from '../state/scigateway.types';
import { StateType } from '../state/state.types';
import { push } from 'connected-react-router';
import { getAppStrings, getString } from '../state/strings';
import { UKRITheme } from '../theming';
import UserProfileComponent from './userProfile.component';
import NotificationBadgeComponent from '../notifications/notificationBadge.component';

interface MainAppProps {
  drawerOpen: boolean;
  res: AppStrings | undefined;
  showContactButton: boolean;
  showHelpPageButton: boolean;
  showAdminPageButton: boolean;
  loggedIn: boolean;
  darkMode: boolean;
}

interface MainAppDispatchProps {
  toggleDrawer: () => Action;
  navigateToHome: () => Action;
  navigateToContactPage: () => Action;
  navigateToHelpPage: () => Action;
  navigateToAdminPage: () => Action;
  toggleHelp: () => Action;
  manageCookies: () => Action;
  toggleDarkMode: (preference: boolean) => Action;
}

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      width: '100%',
    },
    appBar: {
      backgroundColor: theme.palette.primary.main,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeIn,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: `calc(100% - ${(theme as UKRITheme).drawerWidth}px)`,
      marginLeft: (theme as UKRITheme).drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    grow: {
      flexGrow: 1,
    },
    titleButton: {
      padding: 4,
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
      marginRight: 20,
      color: theme.palette.primary.contrastText,
    },
    menuButtonPlaceholder: {
      marginLeft: -12,
      marginRight: 20,
      width: 48,
    },
    hide: {
      display: 'none',
    },
  });

type CombinedMainAppBarProps = MainAppProps &
  MainAppDispatchProps &
  WithStyles<typeof styles>;

const MainAppBar = (props: CombinedMainAppBarProps): React.ReactElement => {
  const [getMenuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
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
  return (
    <div className={props.classes.root}>
      <AppBar
        position="static"
        className={classNames(props.classes.appBar, {
          [props.classes.appBarShift]: props.drawerOpen,
        })}
      >
        <Toolbar>
          {props.loggedIn ? (
            <IconButton
              className={classNames(
                props.classes.menuButton,
                props.drawerOpen && props.classes.hide,
                'tour-nav-menu'
              )}
              color="inherit"
              onClick={props.toggleDrawer}
              aria-label="Open navigation menu"
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <div className={props.classes.menuButtonPlaceholder} />
          )}
          <Button
            className={classNames(props.classes.titleButton, 'tour-title')}
            onClick={props.navigateToHome}
            aria-label="Homepage"
          >
            <img src={ScigatewayLogo} alt={getString(props.res, 'title')} />
          </Button>
          {props.showContactButton ? (
            <Button
              className={classNames(props.classes.button, 'tour-contact')}
              style={{ paddingTop: 3 }}
              onClick={props.navigateToContactPage}
              aria-label="Contactpage"
            >
              <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
                {getString(props.res, 'contact')}
              </Typography>
            </Button>
          ) : null}
          {props.showHelpPageButton ? (
            <Button
              className={classNames(props.classes.button, 'tour-help')}
              style={{ paddingTop: 3 }}
              onClick={props.navigateToHelpPage}
              aria-label="Helppage"
            >
              <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
                {getString(props.res, 'help')}
              </Typography>
            </Button>
          ) : null}
          {props.showAdminPageButton ? (
            <Button
              className={classNames(props.classes.button, 'tour-admin')}
              style={{ paddingTop: 3 }}
              onClick={props.navigateToAdminPage}
              aria-label="Adminpage"
            >
              <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
                {getString(props.res, 'admin')}
              </Typography>
            </Button>
          ) : null}
          <div className={props.classes.grow} />
          <IconButton
            className={props.classes.button}
            onClick={props.toggleHelp}
            aria-label="Help"
          >
            <HelpIcon />
          </IconButton>
          <IconButton
            className={classNames(props.classes.button, 'tour-settings')}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            aria-label="Open browser settings"
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
                primary={getString(props.res, 'toggle-dark-mode')}
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
  showContactButton: state.scigateway.features.showContactButton,
  showHelpPageButton: state.scigateway.features.showHelpPageButton,
  loggedIn: state.scigateway.authorisation.provider.isLoggedIn(),
  showAdminPageButton:
    state.scigateway.authorisation.provider.isLoggedIn() &&
    state.scigateway.authorisation.provider.isAdmin(),
  res: getAppStrings(state, 'main-appbar'),
  darkMode: state.scigateway.darkMode,
});

const mapDispatchToProps = (dispatch: Dispatch): MainAppDispatchProps => ({
  toggleDrawer: () => dispatch(toggleDrawer()),
  navigateToHome: () => dispatch(push('/')),
  navigateToContactPage: () => dispatch(push('/contact')),
  navigateToHelpPage: () => dispatch(push('/help')),
  navigateToAdminPage: () => dispatch(push('/admin')),
  toggleHelp: () => dispatch(toggleHelp()),
  manageCookies: () => dispatch(push('/cookies')),
  toggleDarkMode: (preference: boolean) =>
    dispatch(loadDarkModePreference(preference)),
});

export const MainAppBarWithStyles = withStyles(styles)(MainAppBar);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainAppBarWithStyles);
