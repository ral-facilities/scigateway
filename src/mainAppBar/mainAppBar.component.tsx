import React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import HelpIcon from '@material-ui/icons/HelpOutline';
import MenuIcon from '@material-ui/icons/Menu';
import {
  withStyles,
  createStyles,
  Theme,
  StyleRules,
  WithStyles,
} from '@material-ui/core/styles';
import classNames from 'classnames';
import { toggleDrawer } from '../state/actions/daaas.actions';
import { AppStrings } from '../state/daaas.types';
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
  loggedIn: boolean;
}

interface MainAppDispatchProps {
  toggleDrawer: () => Action;
  navigateToHome: () => Action;
}

interface ActionProps {
  buttonText: string;
  buttonClassName: string;
  onClick: () => Action;
}

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      width: '100%',
    },
    appBar: {
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
    title: {
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'block',
      },
      marginRight: 20,
      cursor: 'pointer',
    },
    button: {
      margin: theme.spacing.unit,
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

export const ActionButton = (props: ActionProps): React.ReactElement => (
  <Button onClick={props.onClick} className={props.buttonClassName}>
    <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
      {props.buttonText}
    </Typography>
  </Button>
);

type CombinedMainAppBarProps = MainAppProps &
  MainAppDispatchProps &
  WithStyles<typeof styles>;

const MainAppBar = (props: CombinedMainAppBarProps): React.ReactElement => (
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
              props.drawerOpen && props.classes.hide
            )}
            color="inherit"
            onClick={props.toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <div className={props.classes.menuButtonPlaceholder} />
        )}
        <Typography
          className={props.classes.title}
          variant="h6"
          color="inherit"
          noWrap
          onClick={props.navigateToHome}
        >
          {getString(props.res, 'title')}
        </Typography>
        {props.showContactButton ? (
          <Button className={props.classes.button} style={{ paddingTop: 3 }}>
            <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
              {getString(props.res, 'contact')}
            </Typography>
          </Button>
        ) : null}
        <div className={props.classes.grow} />
        <IconButton className={props.classes.button}>
          <HelpIcon />
        </IconButton>
        {props.loggedIn ? <NotificationBadgeComponent /> : null}
        <UserProfileComponent />
      </Toolbar>
    </AppBar>
  </div>
);

const mapStateToProps = (state: StateType): MainAppProps => ({
  drawerOpen: state.daaas.drawerOpen,
  showContactButton: state.daaas.features.showContactButton,
  loggedIn: state.daaas.authorisation.provider.isLoggedIn(),
  res: getAppStrings(state, 'main-appbar'),
});

const mapDispatchToProps = (dispatch: Dispatch): MainAppDispatchProps => ({
  toggleDrawer: () => dispatch(toggleDrawer()),
  navigateToHome: () => dispatch(push('/')),
});

export const MainAppBarWithStyles = withStyles(styles)(MainAppBar);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainAppBarWithStyles);
