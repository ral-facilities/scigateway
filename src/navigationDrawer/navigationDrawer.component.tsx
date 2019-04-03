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
import { RegisterRoutePayload } from '../state/daaas.types';
import { StateType } from '../state/state.types';

interface NavigationDrawerProps {
  open: boolean;
  plugins: RegisterRoutePayload[];
}

interface NavigationDrawerDispatchProps {
  toggleDrawer: () => Action;
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
  private createLink(plugin: RegisterRoutePayload): React.ReactElement {
    return (
      <LinkListItem to={plugin.link}>
        <ListItemText
          inset
          primary={plugin.displayName ? plugin.displayName : plugin.plugin}
        />
      </LinkListItem>
    );
  }

  // Convert the list of plugins into a structured dataset for rendering
  private structureMenuData(
    plugins: RegisterRoutePayload[]
  ): NavigationDrawerContent {
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
        <ListItem>
          <ListItemText
            primary={sectionName}
            primaryTypographyProps={{ variant: 'h6' }}
          />
        </ListItem>
        <List component="nav">{plugins.map(p => this.createLink(p))}</List>
      </Fragment>
    );
  }

  private renderRoutes(): React.ReactFragment {
    const { plugins } = this.props;
    console.log(plugins);
    const sectionPlugins = this.structureMenuData(plugins);
    return (
      <List>
        {Object.keys(sectionPlugins).map(section =>
          this.buildMenuSection(section, sectionPlugins[
            section
          ] as RegisterRoutePayload[])
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
