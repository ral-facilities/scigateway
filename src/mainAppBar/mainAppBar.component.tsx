import React from 'react';
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
import { Dispatch, Action } from 'redux';
import { toggleDrawer } from '../state/actions/daaas.actions';
import { connect } from 'react-redux';
import { StateType } from '../state/state.types';

interface MainAppProps {
  drawerOpen: boolean;
}

interface MainAppDispatchProps {
  toggleDrawer: () => Action;
}

interface MenuButtonProps {
  buttonText: string;
  buttonClassName: string;
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
        >
          Data Analysis as a Service
        </Typography>
        <MenuButton
          buttonText="Contact"
          buttonClassName={props.classes.button}
        />
        <div className={props.classes.grow} />
        <IconButton className={props.classes.button}>
          <HelpIcon />
        </IconButton>
        <IconButton className={props.classes.button}>
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  </div>
);

const mapStateToProps = (state: StateType): MainAppProps => ({
  drawerOpen: state.daaas.drawerOpen,
});

const mapDispatchToProps = (dispatch: Dispatch): MainAppDispatchProps => ({
  toggleDrawer: () => dispatch(toggleDrawer()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MainAppBar));
