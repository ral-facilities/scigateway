import React, { Component, Fragment } from 'react';
import { IconButton, Theme, Typography } from '@material-ui/core';
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
import { AppStrings, PluginConfig } from '../state/scigateway.types';
import { StateType } from '../state/state.types';
import { structureMenuData } from '../state/pluginhelper';
import { UKRITheme } from '../theming';
import STFCLogoWhiteText from '../images/stfc-logo-white-text.png';
import STFCLogoBlueText from '../images/stfc-logo-blue-text.png';
import { getAppStrings, getString } from '../state/strings';

interface NavigationDrawerProps {
  open: boolean;
  plugins: PluginConfig[];
  darkMode: boolean;
  homepageUrl?: string;
  res: AppStrings | undefined;
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
      top: '64px',
      height: 'calc(100% - 45px - 64px)',
      position: 'absolute',
    },
    // drawerHeader: {
    //   ...theme.mixins.toolbar,
    //   display: 'flex',
    //   alignItems: 'center',
    //   padding: '0 8px',
    //   justifyContent: 'flex-end',
    // },
    sectionTitle: {
      textAlign: 'left',
      paddingTop: theme.spacing(1),
      paddingBottom: 0,
      color: (theme as UKRITheme).colours.homePage.description,
      paddingLeft: theme.spacing(2),
    },
    menuItem: {
      textAlign: 'left',
      fontWeight: 'bold',
      color: (theme as UKRITheme).colours.blue,
    },
    menuLogo: {
      paddingRight: 25,
      paddingLeft: 25,
      paddingBottom: 24,
      height: 40,
      bottom: 24,
      position: 'absolute',
      color: theme.palette.text.secondary,
    },
  });

export type CombinedNavigationProps = NavigationDrawerDispatchProps &
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
        dense
      >
        {/* Uncomment this to add DataGateway logo next to each button */}
        {/* {imgSrc && (
          <img
            className={this.props.classes.menuLogo}
            alt={plugin.logoAltText}
            src={imgSrc}
          />
        )} */}
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
        <Typography variant="h6" className={this.props.classes.sectionTitle}>
          {sectionName}
        </Typography>
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
      <Fragment>
        {Object.keys(sectionPlugins)
          .sort()
          .map((section, i) =>
            this.buildMenuSection(
              section,
              sectionPlugins[section] as PluginConfig[],
              i
            )
          )}
      </Fragment>
    );
  }

  public render(): React.ReactElement {
    // const { plugins } = this.props;
    const imgSrc = this.props.darkMode ? STFCLogoWhiteText : STFCLogoBlueText;
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
            aria-label={getString(this.props.res, 'close-navigation-menu')}
          >
            <ChevronLeftIcon />
          </IconButton>
        </StyledHeader>
        {/* </div> */}

        {this.renderRoutes()}

        {imgSrc && (
          <img
            className={this.props.classes.menuLogo}
            alt={getString(this.props.res, 'alternative-text')}
            src={imgSrc}
          />
        )}
      </Drawer>
    );
  }
}

const mapStateToProps = (state: StateType): NavigationDrawerProps => ({
  open: state.scigateway.drawerOpen,
  plugins: state.scigateway.plugins,
  darkMode: state.scigateway.darkMode,
  homepageUrl: state.scigateway.homepageUrl,
  res: getAppStrings(state, 'navigation-drawer'),
});

const mapDispatchToProps = (
  dispatch: Dispatch
): NavigationDrawerDispatchProps => ({
  toggleDrawer: () => dispatch(toggleDrawer()),
});

export const NavigationDrawerWithStyles = withStyles(styles)(NavigationDrawer);
export const NavigationDrawerWithoutStyles = NavigationDrawer;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationDrawerWithStyles);
