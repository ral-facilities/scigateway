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

interface NavigationDrawerProps {
  open: boolean;
}

const drawerWidth = 240;

const styles = (): StyleRules =>
  createStyles({
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
  });

const NavigationDrawer = (
  props: NavigationDrawerProps & WithStyles<typeof styles>
): React.ReactElement => (
  <Drawer
    className={props.classes.drawer}
    variant="persistent"
    anchor="left"
    open={props.open}
    classes={{
      paper: props.classes.drawerPaper,
    }}
  />
);

const mapStateToProps = (state: StateType): NavigationDrawerProps => ({
  open: state.daaas.drawerOpen,
});

export default connect(mapStateToProps)(withStyles(styles)(NavigationDrawer));
