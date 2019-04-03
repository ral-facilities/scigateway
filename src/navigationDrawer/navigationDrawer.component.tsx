import React, { Component, Fragment } from 'react';
import { IconButton, Divider, Theme } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import {
  withStyles,
  createStyles,
  StyleRules,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import { toggleDrawer } from '../state/actions/daaas.actions';
import { RegisterRoutePayload } from '../state/daaas.types';
import { StateType } from '../state/state.types';

interface NavigationDrawerProps {
  open: boolean;
  plugins: RegisterRoutePayload[];
}

interface NavigationDrawerDispatchProps {
  toggleDrawer: () => Action;
  pushLink: (link: string) => Action;
}

interface NavigationDrawerContent {
  [section: string]: RegisterRoutePayload[];
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
    drawerSection: {
      marginLeft: '6px',
    },
    drawerLink: {
      marginLeft: '18px',
    },
  });

type CombinedNavigationProps = NavigationDrawerDispatchProps &
  NavigationDrawerProps &
  WithStyles<typeof styles>;

class NavigationDrawer extends Component<CombinedNavigationProps> {
  private handleClick(link: string): void {
    const { pushLink } = this.props;
    console.log(`Caught click; pushing ${link}`);
    pushLink(link);
  }

  private createLink(plugin: RegisterRoutePayload): React.ReactElement {
    return (
      <div
        onClick={() => this.handleClick(plugin.link)}
        className={this.props.classes.drawerLink}
      >
        {plugin.displayName ? plugin.displayName : plugin.plugin}
      </div>
    );
  }

  private buildMenu(plugins: RegisterRoutePayload[]): NavigationDrawerContent {
    const dict: NavigationDrawerContent = {};
    plugins.forEach(p => {
      if (!(p.section in dict)) {
        dict[p.section] = [];
      }
      dict[p.section].push(p);
    });
    return dict;
  }

  private buildMenuSection(
    sectionName: string,
    plugins: RegisterRoutePayload[]
  ): React.ReactElement {
    return (
      <Fragment>
        <Typography variant="h6" className={this.props.classes.drawerSection}>
          {sectionName}
        </Typography>
        {plugins.map(p => this.createLink(p))}
      </Fragment>
    );
  }

  private renderRoutes(): React.ReactFragment {
    const { plugins } = this.props;
    console.log(plugins);
    const menuDict = this.buildMenu(plugins);
    return (
      <Fragment>
        {Object.keys(menuDict).map(k =>
          this.buildMenuSection(k, menuDict[k] as RegisterRoutePayload[])
        )}
      </Fragment>
    );
  }

  public render(): React.ReactElement {
    return (
      <Drawer
        className={this.props.classes.drawer}
        variant="persistent"
        anchor="left"
        open={this.props.open}
        classes={{
          paper: this.props.classes.drawerPaper,
        }}
      >
        <div className={this.props.classes.drawerHeader}>
          <IconButton onClick={this.props.toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        {this.renderRoutes()}
      </Drawer>
    );
  }
}

const mapStateToProps = (state: StateType): NavigationDrawerProps => ({
  open: state.daaas.drawerOpen,
  plugins: state.daaas.plugins,
});

const mapDispatchToProps = (
  dispatch: Dispatch
): NavigationDrawerDispatchProps => ({
  toggleDrawer: () => dispatch(toggleDrawer()),
  pushLink: link => dispatch(push(link)),
});

export const NavigationDrawerWithStyles = withStyles(styles)(NavigationDrawer);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationDrawerWithStyles);
