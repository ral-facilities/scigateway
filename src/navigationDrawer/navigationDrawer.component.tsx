import React, { Fragment, useCallback } from 'react';
import {
  Box,
  ListItemButton,
  styled,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useDispatch, useSelector } from 'react-redux';
import { Link, LinkProps } from 'react-router-dom';
import { PluginConfig } from '../state/scigateway.types';
import { StateType } from '../state/state.types';
import { structureMenuData } from '../state/pluginhelper';
import STFCLogoWhiteText from '../images/stfc-logo-white-text.png';
import STFCLogoBlueText from '../images/stfc-logo-blue-text.png';
import { getAppStrings, getString } from '../state/strings';
import { useTheme } from '@mui/material/styles';
import { toggleDrawer } from '../state/actions/scigateway.actions';

const LogoImage = styled('img')(({ theme }) => ({
  paddingRight: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  width: '188px',
  paddingBottom: 24,
  color: theme.palette.text.secondary,
}));

// This has been adapted from the MaterialUI composition guide
// (https://material-ui.com/guides/composition/)
const ForwardRefLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (linkProps, ref) => <Link innerRef={ref} {...linkProps} />
);
ForwardRefLink.displayName = 'ForwardRefLink';

export const NavigationDrawer = (): React.ReactElement => {
  const isDrawerOpen = useSelector(
    (state: StateType) => state.scigateway.drawerOpen
  );
  const plugins = useSelector((state: StateType) => state.scigateway.plugins);
  const isDarkMode = useSelector(
    (state: StateType) => state.scigateway.darkMode
  );
  const homepageUrl = useSelector(
    (state: StateType) => state.scigateway.homepageUrl
  );
  const res = useSelector((state: StateType) =>
    getAppStrings(state, 'navigation-drawer')
  );
  const navigationDrawerLogo = useSelector(
    (state: StateType) => state.scigateway.navigationDrawerLogo
  );

  const dispatch = useDispatch();

  const theme = useTheme();
  const isViewportMdOrLarger = useMediaQuery(theme.breakpoints.up('md'));

  const createLink = useCallback(
    (plugin: PluginConfig, index: number): React.ReactElement => {
      const imgSrc = isDarkMode ? plugin.logoDarkMode : plugin.logoLightMode;

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
          disablePadding
          dense
        >
          <ListItemButton>
            <ListItemText
              primary={displayText}
              primaryTypographyProps={{
                variant: 'subtitle1',
                sx: {
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: (theme: Theme) => theme.colours.blue,
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      );
    },
    [isDarkMode]
  );

  const buildMenuSection = useCallback(
    (
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
              color: (theme: Theme) => theme.colours.contrastGrey,
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
    },
    [createLink]
  );

  const renderRoutes = useCallback((): React.ReactElement => {
    // don't include link to homepage in nav bar
    const filteredPlugins = homepageUrl
      ? plugins.filter((plugin) => plugin.link !== homepageUrl)
      : plugins;

    // Do not include admin plugins or plugins that explicitly ask to hide in the drawer list
    const sectionPlugins = structureMenuData(
      filteredPlugins.filter((plugin) => !plugin.admin && !plugin.hideFromMenu)
    );

    return (
      <>
        {Object.keys(sectionPlugins)
          .sort()
          .map((section, i) =>
            buildMenuSection(
              section,
              sectionPlugins[section] as PluginConfig[],
              i
            )
          )}
      </>
    );
  }, [buildMenuSection, plugins, homepageUrl]);

  const altTxt =
    navigationDrawerLogo?.altTxt ?? getString(res, 'alternative-text');

  // check if there is a custom logo supplied
  // if not, fallback to the default STFC logo
  let drawerLogoToUse;
  if (navigationDrawerLogo) {
    drawerLogoToUse = isDarkMode
      ? navigationDrawerLogo.dark
      : navigationDrawerLogo.light;
  } else {
    drawerLogoToUse = isDarkMode ? STFCLogoWhiteText : STFCLogoBlueText;
  }

  return (
    <Drawer
      sx={{
        width: (theme: Theme) => theme.drawerWidth,
        flexShrink: 0,
      }}
      variant={isViewportMdOrLarger ? 'persistent' : undefined}
      anchor="left"
      open={isDrawerOpen}
      onClose={() => dispatch(toggleDrawer())}
      PaperProps={
        isViewportMdOrLarger
          ? {
              sx: (theme: Theme) => ({
                width: theme.drawerWidth,
                background: theme.palette.background.default,
                top: theme.mainAppBarHeight,
                height: `calc(100% - ${theme.footerHeight} - ${theme.mainAppBarHeight})`,
                position: 'absolute',
              }),
            }
          : {}
      }
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        height="100%"
        boxSizing="border-box"
      >
        {renderRoutes()}

        {drawerLogoToUse && (
          <Box marginTop="auto">
            <LogoImage alt={altTxt} src={drawerLogoToUse} />
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default NavigationDrawer;
