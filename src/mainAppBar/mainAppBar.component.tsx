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
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import {
  withStyles,
  createStyles,
  Theme,
  StyleRules,
  WithStyles,
} from '@material-ui/core/styles';
import classNames from 'classnames';
import { toggleDrawer, signOut } from '../state/actions/daaas.actions';
import { AppStrings } from '../state/daaas.types';
import { StateType } from '../state/state.types';
import { push } from 'connected-react-router';
import { getAppStrings, getString } from '../state/strings';

interface MainAppProps {
  drawerOpen: boolean;
  res: AppStrings | undefined;
}

interface MainAppDispatchProps {
  toggleDrawer: () => Action;
  navigateToHome: () => Action;
  signOut: () => Action;
}

interface MenuButtonProps {
  buttonText: string;
  buttonClassName: string;
}

interface ActionProps {
  buttonText: string;
  buttonClassName: string;
  onClick: () => Action;
}

const drawerWidth = 240;

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      width: '100%',
    },
    appBar: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
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
    hide: {
      display: 'none',
    },
  });

export const MenuButton = (props: MenuButtonProps): React.ReactElement => (
  <Button className={props.buttonClassName}>
    <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
      {props.buttonText}
    </Typography>
  </Button>
);

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
        <Typography
          className={props.classes.title}
          variant="h6"
          color="inherit"
          noWrap
          onClick={props.navigateToHome}
        >
          {getString(props.res, 'title')}
        </Typography>
        <MenuButton
          buttonText={getString(props.res, 'contact')}
          buttonClassName={props.classes.button}
        />
        <div className={props.classes.grow} />
        <IconButton className={props.classes.button}>
          <HelpIcon />
        </IconButton>
        <IconButton className={props.classes.button}>
          <AccountCircleIcon />
        </IconButton>
        <ActionButton
          buttonText="sign out"
          buttonClassName={props.classes.button}
          onClick={props.signOut}
        />
      </Toolbar>
    </AppBar>
  </div>
);

const mapStateToProps = (state: StateType): MainAppProps => ({
  drawerOpen: state.daaas.drawerOpen,
  res: getAppStrings(state, 'main-appbar'),
});

const mapDispatchToProps = (dispatch: Dispatch): MainAppDispatchProps => ({
  toggleDrawer: () => dispatch(toggleDrawer()),
  navigateToHome: () => dispatch(push('/')),
  signOut: () => dispatch(signOut()),
});

export const MainAppBarWithStyles = withStyles(styles)(MainAppBar);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainAppBarWithStyles);
