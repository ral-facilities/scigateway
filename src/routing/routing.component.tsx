import { useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import * as singleSpa from 'single-spa';
import AccessibilityPage from '../accessibilityPage/accessibilityPage.component';
import AdminPage from '../adminPage/adminPage.component';
import NullAuthProvider from '../authentication/nullAuthProvider';
import CookiesPage from '../cookieConsent/cookiesPage.component';
import HelpPage from '../helpPage/helpPage.component';
import HomePage from '../homePage/homePage.component';
import LoginPage from '../loginPage/loginPage.component';
import LogoutPage from '../logoutPage/logoutPage.component';
import MaintenancePage from '../maintenancePage/maintenancePage.component';
import PageNotFound from '../pageNotFound/pageNotFound.component';
import { Preloader } from '../preloader/preloader.component';
import {
  MaintenanceState,
  PluginConfig,
  baseAdminRoutes,
  scigatewayRoutes,
} from '../state/scigateway.types';
import { StateType } from '../state/state.types';
import withAuth, { usePrevious } from './authorisedRoute.component';

interface ContainerDivProps {
  drawerOpen: boolean;
  isMobileViewport: boolean;
}

const ContainerDiv = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'drawerOpen' && prop !== 'isMobileViewport',
})<ContainerDivProps>(({ theme, drawerOpen, isMobileViewport }) => {
  if (drawerOpen) {
    return {
      width: isMobileViewport ? '100%' : `calc(100% - ${theme.drawerWidth})`,
      maxHeight: isMobileViewport
        ? `calc(100vh - ${theme.mainAppBarHeight})`
        : `calc(100vh - ${theme.mainAppBarHeight} - ${theme.footerHeight})`,
      overflow: 'auto',
      '@media print': {
        overflow: 'visible',
      },
      marginLeft: isMobileViewport ? 0 : theme.drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    };
  }

  return {
    width: '100%',
    maxHeight: isMobileViewport
      ? `calc(100vh - ${theme.mainAppBarHeight})`
      : `calc(100vh - ${theme.mainAppBarHeight} - ${theme.footerHeight})`,
    overflow: 'auto',
    '@media print': {
      overflow: 'visible',
    },
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeIn,
      duration: theme.transitions.duration.leavingScreen,
    }),
  };
});

export const getAdminRoutes = (props: {
  plugins: PluginConfig[];
}): Record<string, string> => {
  const { plugins } = props;
  const newAdminRoutes: Record<string, string> = JSON.parse(
    JSON.stringify(baseAdminRoutes)
  );

  // Note: Any nested paths under `/admin/path` are managed by the plugin itself and
  // should not be included in the `newAdminRoutes` object. This ensures only top-level
  // admin routes are added here, keeping the route structure consistent and preventing
  // conflicts in routing.

  plugins.forEach((plugin) => {
    if (plugin.admin) {
      const routeKey = plugin.link.split('/')[2];
      newAdminRoutes[routeKey] = plugin.link;
    }
  });

  return newAdminRoutes;
};

interface RoutingProps {
  plugins: PluginConfig[];
  drawerOpen: boolean;
  maintenance: MaintenanceState;
  userIsLoggedIn: boolean;
  userIsAutoLoggedIn: boolean;
  userIsAdmin: boolean;
  nullAuthProvider: boolean;
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
export const UnauthorisedPlugin = PluginPlaceHolder;
// Prevents the component from updating when the draw is opened/closed
export const AuthorisedAdminPage = withAuth(true)(AdminPage);

const popSessionStorageItem = (
  key: string
): ReturnType<typeof sessionStorage.getItem> => {
  const result = sessionStorage.getItem(key);
  sessionStorage.removeItem(key);
  return result;
};

const Routing: React.FC<RoutingProps> = (props: RoutingProps) => {
  const theme = useTheme();
  const isMobileViewport = useMediaQuery(theme.breakpoints.down('md'));

  const location = useLocation();

  // this useEffect should catch any instances of single-spa "thinking" a plugin is loaded
  // when it actually isn't, and calls unloadApplication to force single-spa to reload
  React.useEffect(() => {
    const pluginConf = props.plugins.find((p) =>
      location.pathname.startsWith(p.link.split('?')[0])
    );

    let intervalId: number | undefined;

    // if we find pluginConf, we're on a plugin route
    if (pluginConf) {
      // set interval to give plugin divs a chance to load
      intervalId = window.setInterval(() => {
        // if we find the plugin div, it's loaded so can stop the interval
        if (document.getElementById(pluginConf.plugin)) {
          // if plugin div has loaded but still has loading spinner, tell single-spa to reload
          if (document.getElementById('plugin-preloader')) {
            singleSpa.unloadApplication(pluginConf.plugin);
          }
          window.clearInterval(intervalId);
        }
      }, 500);
    }
    return () => {
      window.clearInterval(intervalId);
    };
  }, [location.pathname, props.plugins]);

  const prevUserIsLoggedIn = usePrevious(props.userIsLoggedIn);
  const prevUserIsAutoLoggedIn = usePrevious(props.userIsAutoLoggedIn);

  return (
    // If a user is authorised, redirect to the URL they attempted to navigate to e.g. "/plugin"
    // Otherwise render the login component. Successful logins will continue to the requested
    // route, otherwise they will continue to be prompted to log in.
    // "/" is always accessible
    <ContainerDiv
      drawerOpen={props.drawerOpen}
      isMobileViewport={isMobileViewport}
    >
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
             As the initial state of userIsLoggedIn is false we have to wait
             until the page has fully loaded so it can receive the correct state
             for userIsLoggedIn */}
          {props.nullAuthProvider ? (
            <Redirect to={scigatewayRoutes.home} />
          ) : !props.userIsLoggedIn ||
            // if authorisedRoute redirected here but we're now autoLoggedIn, don't show login page & instead redirect - otherwise we want to show it
            (props.userIsAutoLoggedIn &&
              (location.state as { referredFrom?: string })?.referredFrom !==
                'authorisedRoute') ||
            props.loading ? (
            <LoginPage />
          ) : (
            <Redirect
              to={{
                pathname:
                  (prevUserIsLoggedIn === false ||
                    (prevUserIsAutoLoggedIn && !props.userIsAutoLoggedIn)) &&
                  props.userIsLoggedIn
                    ? (((location.state as { referrer?: string })?.referrer ||
                        popSessionStorageItem('referrer')) ??
                      scigatewayRoutes.home)
                    : scigatewayRoutes.logout,
                state: {
                  referrer: location.pathname,
                  referredFrom: 'postLoginRedirect',
                },
              }}
            />
          )}
        </Route>
        <Route exact path={scigatewayRoutes.logout}>
          {props.nullAuthProvider ? (
            <Redirect to={scigatewayRoutes.home} />
          ) : (props.userIsLoggedIn && !props.userIsAutoLoggedIn) ||
            props.loading ? (
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
          props.plugins.map((plugin) => {
            return (
              <Route key={plugin.plugin} path={plugin.link.split('?')[0]}>
                {plugin.unauthorised ? (
                  <UnauthorisedPlugin id={plugin.plugin} />
                ) : (
                  <AuthorisedPlugin id={plugin.plugin} />
                )}
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
  drawerOpen: state.scigateway.drawerOpen,
  maintenance: state.scigateway.maintenance,
  userIsLoggedIn: state.scigateway.authorisation.provider.isLoggedIn(),
  userIsAutoLoggedIn:
    state.scigateway.authorisation.provider.isLoggedIn() &&
    typeof state.scigateway.authorisation.provider.autoLogin !== 'undefined' &&
    localStorage.getItem('autoLogin') === 'true',
  nullAuthProvider:
    state.scigateway.authorisation.provider instanceof NullAuthProvider,
  userIsAdmin: state.scigateway.authorisation.provider.isAdmin(),
  homepageUrl: state.scigateway.homepageUrl,
  loading: state.scigateway.siteLoading,
});

export default connect(mapStateToProps)(Routing);
