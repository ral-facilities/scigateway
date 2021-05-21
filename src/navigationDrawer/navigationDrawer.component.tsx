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
  styled,
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

interface NavigationDrawerProps {
  open: boolean;
  plugins: PluginConfig[];
  darkMode: boolean;
  homepageUrl?: string;
}

interface NavigationDrawerDispatchProps {
  toggleDrawer: () => Action;
}

// TODO
// There is a bug with the typing of mixins (see mui-org/material-ui#22208)
// Until this is fixed, use a styled component as a workaround
const StyledHeader = styled('div')(({ theme }) => ({
  ...theme.mixins.toolbar,
  display: 'flex',
  alignItems: 'center',
  padding: '0 8px',
  justifyContent: 'flex-end',
}));

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
    // drawerHeader: {
    //   ...theme.mixins.toolbar,
    //   display: 'flex',
    //   alignItems: 'center',
    //   padding: '0 8px',
    //   justifyContent: 'flex-end',
    // },
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
    const imgSrc = this.props.darkMode
      ? plugin.logoDarkMode
      : plugin.logoLightMode;

    const prefix = !imgSrc && plugin.logoAltText ? plugin.logoAltText : '';

    const displayText = plugin.displayName
      ? prefix + plugin.displayName
      : plugin.plugin;

    return (
      <ListItem
        key={index}
        component={ForwardRefLink}
        to={plugin.link}
        id={`plugin-link-${plugin.link.replace(/\//g, '-')}`}
        button
      >
        {imgSrc && (
          <img
            className={this.props.classes.menuLogo}
            alt={plugin.logoAltText}
            src={imgSrc}
          />
        )}
        <ListItemText
          inset={!imgSrc}
          primary={displayText}
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
          {plugins.map((p, i) => {
            return p.link ? this.createLink(p, i) : null;
          })}
        </List>
      </Fragment>
    );
  }

  private renderRoutes(): React.ReactFragment {
    let { plugins } = this.props;

    if (this.props.homepageUrl) {
      // don't include link to homepage in nav bar
      plugins = plugins.filter(
        (plugin) => plugin.link !== this.props.homepageUrl
      );
    }
    // Do not include non admin plugins in the drawer list
    const sectionPlugins = structureMenuData(
      plugins.filter((plugin) => !plugin.admin)
    );

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
        {/* <div className={this.props.classes.drawerHeader}> */}
        <StyledHeader>
          <IconButton
            onClick={this.props.toggleDrawer}
            aria-label="Dropdown Menu"
          >
            <ChevronLeftIcon />
          </IconButton>
        </StyledHeader>
        {/* </div> */}
        <Divider />
        {this.renderRoutes()}
      </Drawer>
    );
  }
}

const mapStateToProps = (state: StateType): NavigationDrawerProps => ({
  open: state.scigateway.drawerOpen,
  plugins: state.scigateway.plugins,
  darkMode: state.scigateway.darkMode,
  homepageUrl: state.scigateway.homepageUrl,
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
