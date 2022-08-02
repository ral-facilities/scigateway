import React from 'react';
import { styled } from '@mui/material/styles';
import { Redirect, Route, Switch } from 'react-router-dom';
import { StateType } from '../state/state.types';
import {
  adminRoutes,
  MaintenanceState,
  PluginConfig,
  scigatewayRoutes,
} from '../state/scigateway.types';
import { connect } from 'react-redux';
import HomePage from '../homePage/homePage.component';
import HelpPage from '../helpPage/helpPage.component';
import LoginPage from '../loginPage/loginPage.component';
import LogoutPage from '../logoutPage/logoutPage.component';
import CookiesPage from '../cookieConsent/cookiesPage.component';
import MaintenancePage from '../maintenancePage/maintenancePage.component';
import AdminPage from '../adminPage/adminPage.component';
import PageNotFound from '../pageNotFound/pageNotFound.component';
import AccessibilityPage from '../accessibilityPage/accessibilityPage.component';
import withAuth from './authorisedRoute.component';
import { Preloader } from '../preloader/preloader.component';
import * as singleSpa from 'single-spa';

interface ContainerDivProps {
  drawerOpen: boolean;
}

const ContainerDiv = styled('div', {
  shouldForwardProp: (prop) => prop !== 'drawerOpen',
})<ContainerDivProps>(({ theme, drawerOpen }) => {
  if (drawerOpen) {
    return {
      width: `calc(100% - ${theme.drawerWidth})`,
      maxHeight: `calc(100vh - ${theme.mainAppBarHeight} - ${theme.footerHeight} - ${theme.footerPaddingTop} - ${theme.footerPaddingBottom})`,
      overflow: 'auto',
      marginLeft: theme.drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    };
  }

  return {
    width: '100%',
    maxHeight: `calc(100vh - ${theme.mainAppBarHeight} - ${theme.footerHeight} - ${theme.footerPaddingTop} - ${theme.footerPaddingBottom})`,
    overflow: 'auto',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeIn,
      duration: theme.transitions.duration.leavingScreen,
    }),
  };
});

interface RoutingProps {
  plugins: PluginConfig[];
  location: string;
  drawerOpen: boolean;
  maintenance: MaintenanceState;
  userIsloggedIn: boolean;
  userIsAdmin: boolean;
  homepageUrl?: string;
  loading: boolean;
}

export class PluginPlaceHolder extends React.PureComponent<{
  id: string;
}> {
  public render(): React.ReactNode {
    const { id } = this.props;
    return (
      <div id={id}>
        {/* display a loading indicator whilst the plugin is mounting
            the loading indicator is replaced when the plugin itself mounts */}
        <Preloader id="plugin-preloader" loading={true} fullScreen={false} />
      </div>
    );
  }
}

export const AuthorisedPlugin = withAuth(false)(PluginPlaceHolder);
// Prevents the component from updating when the draw is opened/closed
export const AuthorisedAdminPage = withAuth(true)(AdminPage);

export const getPluginRoutes = (
  plugins: PluginConfig[],
  admin?: boolean
): {
  [plugin: string]: string[];
} => {
  const pluginRoutes: {
    [plugin: string]: string[];
  } = {};

  plugins.forEach((p) => {
    const isAdmin = admin ? p.admin : !p.admin;
    const basePluginLink = p.link.split('?')[0];
    if (isAdmin) {
      if (pluginRoutes[p.plugin]) {
        pluginRoutes[p.plugin].push(basePluginLink);
      } else {
        pluginRoutes[p.plugin] = [basePluginLink];
      }
    }
  });
  return pluginRoutes;
};

const Routing: React.FC<RoutingProps> = (props: RoutingProps) => {
  const [pluginRoutes, setPluginRoutes] = React.useState(
    getPluginRoutes(props.plugins)
  );

  // only set to false if we're on a plugin route i.e. not a scigateway route
  const manuallyLoadedPluginRef = React.useRef(
    Object.values(scigatewayRoutes).includes(props.location) ||
      props.location === adminRoutes.maintenance
  );

  React.useEffect(() => {
    let intervalId: number | undefined;
    // only try and manually load the first plugin on initial page load after site loaded using setInterval
    if (!props.loading && !manuallyLoadedPluginRef.current) {
      intervalId = window.setInterval(() => {
        const pluginConf = props.plugins.find((p) =>
          props.location.startsWith(p.link.split('?')[0])
        );

        // finding pluginConf after loading implies that the route has loaded
        // & that the site has loaded, so the plugin should have been loaded already
        // and if it hasn't we need to manually load it
        if (pluginConf && document.getElementById(pluginConf.plugin)) {
          if (document.getElementById('plugin-preloader')) {
            singleSpa.unloadApplication(pluginConf.plugin);
          }
          manuallyLoadedPluginRef.current = true;
          window.clearInterval(intervalId);
        }
      }, 500);
    }

    return () => {
      // you can call clearInterval with an undefined ID fine
      window.clearInterval(intervalId);
    };
  }, [props.loading, props.plugins, props.location]);

  React.useEffect(() => {
    setPluginRoutes(getPluginRoutes(props.plugins));

    // switching between an admin & non-admin route of the same app causes problems
    // as the Route and thus the plugin div changes but single-spa doesn't remount
    // so we need to explicitly tell single-spa to remount that specific plugin
    const handler = (
      event: CustomEvent<{
        oldUrl: string;
        newUrl: string;
      }>
    ): void => {
      const oldPlugin = props.plugins.find((p) =>
        new URL(event.detail.oldUrl).pathname.startsWith(p.link.split('?')[0])
      );
      const newPlugin = props.plugins.find((p) =>
        new URL(event.detail.newUrl).pathname.startsWith(p.link.split('?')[0])
      );

      if (
        oldPlugin &&
        newPlugin &&
        oldPlugin.plugin === newPlugin.plugin &&
        ((oldPlugin.admin && !newPlugin.admin) ||
          (newPlugin.admin && !oldPlugin.admin))
      ) {
        singleSpa.unloadApplication(oldPlugin.plugin);
      }
    };
    window.addEventListener(
      'single-spa:before-no-app-change',
      handler as EventListener
    );
    return () =>
      window.removeEventListener(
        'single-spa:before-no-app-change',
        handler as EventListener
      );
  }, [props.plugins]);

  return (
    // If a user is authorised, redirect to the URL they attempted to navigate to e.g. "/plugin"
    // Otherwise render the login component. Successful logins will continue to the requested
    // route, otherwise they will continue to be prompted to log in.
    // "/" is always accessible
    <ContainerDiv drawerOpen={props.drawerOpen}>
      {/* Redirect to a homepageUrl if set. Otherwise, route to / */}
      <Switch>
        <Route exact path={scigatewayRoutes.home}>
          {props.homepageUrl && props.homepageUrl !== '/' ? (
            <Redirect to={props.homepageUrl} />
          ) : (
            <HomePage />
          )}
        </Route>
        <Route exact path={scigatewayRoutes.help} component={HelpPage} />
        <Route
          exact
          path={scigatewayRoutes.accessibility}
          component={AccessibilityPage}
        />
        <Route
          path={scigatewayRoutes.admin}
          render={() => <AuthorisedAdminPage />}
        />
        <Route exact path={scigatewayRoutes.login}>
          {/* Waits until the site is fully loaded before doing the logic.
             As the intial state of userIsLoggedIn is false we have to wait
             until the page has fully loaded so it can receive the correct state
             for userIsLoggedIn */}
          {!props.userIsloggedIn || props.loading ? (
            <LoginPage />
          ) : (
            <Redirect to={scigatewayRoutes.logout} />
          )}
        </Route>
        <Route exact path={scigatewayRoutes.logout}>
          {props.userIsloggedIn || props.loading ? (
            <LogoutPage />
          ) : (
            <Redirect to={scigatewayRoutes.login} />
          )}
        </Route>
        <Route exact path={scigatewayRoutes.cookies} component={CookiesPage} />
        {/* Only display maintenance page to non-admin users when site under maintenance */}
        {props.maintenance.show && !props.userIsAdmin ? (
          <Route component={MaintenancePage} />
        ) : (
          Object.entries(pluginRoutes).map(([key, value]) => {
            return (
              <Route key={key} path={value}>
                <AuthorisedPlugin id={key} />
              </Route>
            );
          })
        )}
        <Route component={withAuth(false)(PageNotFound)} />
      </Switch>
    </ContainerDiv>
  );
};

const mapStateToProps = (state: StateType): RoutingProps => ({
  plugins: state.scigateway.plugins,
  location: state.router.location.pathname,
  drawerOpen: state.scigateway.drawerOpen,
  maintenance: state.scigateway.maintenance,
  userIsloggedIn:
    state.scigateway.authorisation.provider.isLoggedIn() &&
    !(
      state.scigateway.authorisation.provider.autoLogin &&
      localStorage.getItem('autoLogin') === 'true'
    ),
  userIsAdmin: state.scigateway.authorisation.provider.isAdmin(),
  homepageUrl: state.scigateway.homepageUrl,
  loading: state.scigateway.siteLoading,
});

export default connect(mapStateToProps)(Routing);
