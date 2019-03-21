import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import { connect } from 'react-redux';
import { StateType } from '../state/state.types';
import {
  withStyles,
  createStyles,
  StyleRules,
  WithStyles,
} from '@material-ui/core/styles';
import { IconButton, Divider, Theme } from '@material-ui/core';
import { toggleDrawer } from '../state/actions/daaas.actions';
import { Dispatch, Action } from 'redux';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

interface NavigationDrawerProps {
  open: boolean;
}

interface NavigationDrawerDispatchProps {
  toggleDrawer: () => Action;
}

const drawerWidth = 240;

const styles = (theme: Theme): StyleRules =>
  createStyles({
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end',
    },
  });

type CombinedNavigationProps = NavigationDrawerDispatchProps &
  NavigationDrawerProps &
  WithStyles<typeof styles>;

const NavigationDrawer = (
  props: CombinedNavigationProps
): React.ReactElement => (
  <Drawer
    className={props.classes.drawer}
    variant="persistent"
    anchor="left"
    open={props.open}
    classes={{
      paper: props.classes.drawerPaper,
    }}
  >
    <div className={props.classes.drawerHeader}>
      <IconButton onClick={props.toggleDrawer}>
        <ChevronLeftIcon />
      </IconButton>
    </div>
    <Divider />
  </Drawer>
);

const mapStateToProps = (state: StateType): NavigationDrawerProps => ({
  open: state.daaas.drawerOpen,
});

const mapDispatchToProps = (
  dispatch: Dispatch
): NavigationDrawerDispatchProps => ({
  toggleDrawer: () => dispatch(toggleDrawer()),
});

export const NavigationDrawerWithStyles = withStyles(styles)(NavigationDrawer);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationDrawerWithStyles);
