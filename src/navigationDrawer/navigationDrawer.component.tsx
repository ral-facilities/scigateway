import React, { Component, Fragment } from 'react';
import { IconButton, Divider, Theme } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {
  withStyles,
  createStyles,
  StyleRules,
  WithStyles,
} from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { connect } from 'react-redux';
import { Link, LinkProps } from 'react-router-dom';
import { Dispatch, Action } from 'redux';
import { toggleDrawer } from '../state/actions/scigateway.actions';
import { PluginConfig } from '../state/scigateway.types';
import { StateType } from '../state/state.types';
import { structureMenuData } from '../state/pluginhelper';
import { UKRITheme } from '../theming';
import DatagatewayLogo from '../images/datagateway-logo.svg';
import DatagatewayWhite from '../images/datagateway-white-text-blue-mark-logo.svg';

interface NavigationDrawerProps {
  open: boolean;
  plugins: PluginConfig[];
}

interface NavigationDrawerDispatchProps {
  toggleDrawer: () => Action;
}

const styles = (theme: Theme): StyleRules =>
  createStyles({
    drawer: {
      width: (theme as UKRITheme).drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: (theme as UKRITheme).drawerWidth,
      background: theme.palette.background.default,
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end',
    },
    sectionTitle: {
      color: theme.palette.text.secondary,
    },
    menuItem: {
      color: theme.palette.text.secondary,
    },
    menuLogo: {
      paddingLeft: 56,
      height: 20,
      color: theme.palette.text.secondary,
      display: theme.palette.type === 'dark' ? 'none' : 'inline',
    },
    menuLogoDarkMode: {
      paddingLeft: 56,
      height: 20,
      color: theme.palette.text.secondary,
      display: theme.palette.type === 'dark' ? 'inline' : 'none',
    },
  });

type CombinedNavigationProps = NavigationDrawerDispatchProps &
  NavigationDrawerProps &
  WithStyles<typeof styles>;

// This has been adapted from the MaterialUI composition guide
// (https://material-ui.com/guides/composition/)
const ForwardRefLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (linkProps, ref) => <Link innerRef={ref} {...linkProps} />
);
ForwardRefLink.displayName = 'ForwardRefLink';

class NavigationDrawer extends Component<CombinedNavigationProps> {
  private createLink(plugin: PluginConfig, index: number): React.ReactElement {
    return (
      <ListItem
        key={index}
        component={ForwardRefLink}
        to={plugin.link}
        id={`plugin-link-${plugin.link.replace(/\//g, '-')}`}
        button
      >
        <img
          src={plugin.logo === 'DataGateway' ? DatagatewayLogo : undefined}
          alt={plugin.logo}
          className={this.props.classes.menuLogo}
        />
        <img
          src={plugin.logo === 'DataGateway' ? DatagatewayWhite : undefined}
          alt={plugin.logo}
          className={this.props.classes.menuLogoDarkMode}
        />
        <ListItemText
          primary={plugin.displayName ? plugin.displayName : plugin.plugin}
          primaryTypographyProps={{ variant: 'subtitle1' }}
          classes={{
            primary: this.props.classes.menuItem,
          }}
        />
      </ListItem>
    );
  }

  private buildMenuSection(
    sectionName: string,
    plugins: PluginConfig[],
    index: number
  ): React.ReactElement {
    return (
      <Fragment key={index}>
        <ListItem>
          <ListItemText
            primary={sectionName}
            primaryTypographyProps={{ variant: 'h6' }}
            classes={{
              primary: this.props.classes.sectionTitle,
            }}
          />
        </ListItem>
        <List component="nav">
          {plugins.map((p, i) => this.createLink(p, i))}
        </List>
      </Fragment>
    );
  }

  private renderRoutes(): React.ReactFragment {
    const { plugins } = this.props;
    const sectionPlugins = structureMenuData(plugins);
    return (
      <List>
        {Object.keys(sectionPlugins)
          .sort()
          .map((section, i) =>
            this.buildMenuSection(
              section,
              sectionPlugins[section] as PluginConfig[],
              i
            )
          )}
      </List>
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
          <IconButton
            onClick={this.props.toggleDrawer}
            aria-label="Dropdown Menu"
          >
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
  open: state.scigateway.drawerOpen,
  plugins: state.scigateway.plugins,
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
