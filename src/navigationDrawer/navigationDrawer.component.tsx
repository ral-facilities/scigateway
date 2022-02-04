import React, { Fragment } from 'react';
import { Box, styled, Theme, Typography } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { connect } from 'react-redux';
import { Link, LinkProps } from 'react-router-dom';
import { AppStrings, PluginConfig } from '../state/scigateway.types';
import { StateType } from '../state/state.types';
import { structureMenuData } from '../state/pluginhelper';
import { UKRITheme } from '../theming';
import STFCLogoWhiteText from '../images/stfc-logo-white-text.png';
import STFCLogoBlueText from '../images/stfc-logo-blue-text.png';
import { getAppStrings, getString } from '../state/strings';

export interface NavigationDrawerProps {
  open: boolean;
  plugins: PluginConfig[];
  darkMode: boolean;
  homepageUrl?: string;
  res: AppStrings | undefined;
}

const LogoImage = styled('img')(({ theme }) => ({
  paddingRight: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  height: 40,
  paddingBottom: 24,
  color: theme.palette.text.secondary,
}));

// This has been adapted from the MaterialUI composition guide
// (https://material-ui.com/guides/composition/)
const ForwardRefLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (linkProps, ref) => <Link innerRef={ref} {...linkProps} />
);
ForwardRefLink.displayName = 'ForwardRefLink';

export const NavigationDrawer = (
  props: NavigationDrawerProps
): React.ReactElement => {
  const createLink = (
    plugin: PluginConfig,
    index: number
  ): React.ReactElement => {
    const imgSrc = props.darkMode ? plugin.logoDarkMode : plugin.logoLightMode;

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
        <ListItemText
          inset={!imgSrc}
          primary={displayText}
          primaryTypographyProps={{
            variant: 'subtitle1',
            sx: {
              textAlign: 'left',
              fontWeight: 'bold',
              color: (theme: Theme) => (theme as UKRITheme).colours.blue,
            },
          }}
        />
      </ListItem>
    );
  };

  const buildMenuSection = (
    sectionName: string,
    plugins: PluginConfig[],
    index: number
  ): React.ReactElement => {
    return (
      <Fragment key={index}>
        <Typography
          variant="h6"
          sx={{
            textAlign: 'left',
            paddingTop: 2,
            paddingBottom: 0,
            color: (theme: Theme) => (theme as UKRITheme).colours.contrastGrey,
            paddingLeft: 2,
          }}
        >
          {sectionName}
        </Typography>
        <List component="nav">
          {plugins.map((p, i) => {
            return p.link ? createLink(p, i) : null;
          })}
        </List>
      </Fragment>
    );
  };

  const renderRoutes = (): React.ReactFragment => {
    let { plugins } = props;

    if (props.homepageUrl) {
      // don't include link to homepage in nav bar
      plugins = plugins.filter((plugin) => plugin.link !== props.homepageUrl);
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
            buildMenuSection(
              section,
              sectionPlugins[section] as PluginConfig[],
              i
            )
          )}
      </Fragment>
    );
  };

  const imgSrc = props.darkMode ? STFCLogoWhiteText : STFCLogoBlueText;
  return (
    <Drawer
      sx={{
        width: (theme: Theme) => (theme as UKRITheme).drawerWidth,
        flexShrink: 0,
      }}
      variant="persistent"
      anchor="left"
      open={props.open}
      PaperProps={{
        sx: (theme: Theme) => ({
          width: (theme as UKRITheme).drawerWidth,
          background: theme.palette.background.default,
          top: (theme as UKRITheme).mainAppBarHeight,
          height: `calc(100% - ${(theme as UKRITheme).footerPaddingBottom} - ${
            (theme as UKRITheme).footerPaddingTop
          } - ${(theme as UKRITheme).footerHeight} - ${
            (theme as UKRITheme).mainAppBarHeight
          } )`,
          position: 'absolute',
        }),
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        height="100%"
        boxSizing="border-box"
      >
        {renderRoutes()}

        {imgSrc && (
          <Box marginTop="auto">
            <LogoImage
              alt={getString(props.res, 'alternative-text')}
              src={imgSrc}
            />
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

const mapStateToProps = (state: StateType): NavigationDrawerProps => ({
  open: state.scigateway.drawerOpen,
  plugins: state.scigateway.plugins,
  darkMode: state.scigateway.darkMode,
  homepageUrl: state.scigateway.homepageUrl,
  res: getAppStrings(state, 'navigation-drawer'),
});

export const UnconnectedNavigationDrawer = NavigationDrawer;

export default connect(mapStateToProps)(NavigationDrawer);
