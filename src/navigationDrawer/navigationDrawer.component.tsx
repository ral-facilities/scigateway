import React, { Component, Fragment } from 'react';
import { IconButton, Divider, Theme } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {
  withStyles,
  createStyles,
  StyleRules,
  WithStyles,
} from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dispatch, Action } from 'redux';
import { toggleDrawer } from '../state/actions/daaas.actions';
import { PluginConfig } from '../state/daaas.types';
import { StateType } from '../state/state.types';
import { structureMenuData } from '../state/pluginhelper';
import { UKRITheme } from '../theming';

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
      background: theme.palette.secondary.main,
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end',
    },
    sectionTitle: {
      color: theme.palette.secondary.contrastText,
    },
    menuItem: {
      color: theme.palette.secondary.contrastText,
    },
  });

type CombinedNavigationProps = NavigationDrawerDispatchProps &
  NavigationDrawerProps &
  WithStyles<typeof styles>;

interface LinkListItemProps extends ListItemProps {
  to: string;
}

const LinkListItem = (props: LinkListItemProps): React.ReactElement => (
  // an `any` is required here to pass the additional properties through to the
  // ListItem as per the material-ui documentation
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  <ListItem button {...props} component={Link as any} />
);

class NavigationDrawer extends Component<CombinedNavigationProps> {
  private createLink(plugin: PluginConfig, index: number): React.ReactElement {
    return (
      <LinkListItem
        key={index}
        to={plugin.link}
        id={`plugin-link-${plugin.link.replace(/\//g, '-')}`}
      >
        <ListItemText
          inset
          primary={plugin.displayName ? plugin.displayName : plugin.plugin}
          primaryTypographyProps={{ variant: 'subtitle1' }}
          classes={{
            primary: this.props.classes.menuItem,
          }}
        />
      </LinkListItem>
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
});

export const NavigationDrawerWithStyles = withStyles(styles)(NavigationDrawer);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationDrawerWithStyles);
