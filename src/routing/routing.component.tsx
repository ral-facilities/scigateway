import React from 'react';
import {
  withStyles,
  createStyles,
  Theme,
  StyleRules,
  WithStyles,
} from '@material-ui/core/styles';
import { Route, Switch, Redirect } from 'react-router';
import { StateType } from '../state/state.types';
import {
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
import AccessibilityPage from '../accessibiltyPage/accessibilityPage.component';
import classNames from 'classnames';
import { UKRITheme } from '../theming';
import withAuth from './authorisedRoute.component';
import { Preloader } from '../preloader/preloader.component';
import * as singleSpa from 'single-spa';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    container: {
      paddingBottom: '36px',
      width: '100%',
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeIn,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    containerShift: {
      width: `calc(100% - ${(theme as UKRITheme).drawerWidth}px)`,
      marginLeft: (theme as UKRITheme).drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
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
        <Preloader loading={true} fullScreen={false} />
      </div>
    );
  }
}

export const AuthorisedPlugin = withAuth(false)(PluginPlaceHolder);
export const AuthorisedAdminPlugin = withAuth(true)(PluginPlaceHolder);
// Prevents the component from updating when the draw is opened/ closed
export const AuthorisedAdminPage = withAuth(true)(AdminPage);

const getPluginRoutes = (
  plugins: PluginConfig[]
): {
  [plugin: string]: string[];
} => {
  const pluginRoutes: {
    [plugin: string]: string[];
  } = {};
  plugins.forEach((p) => {
    if (!p.admin) {
      if (pluginRoutes[p.plugin]) {
        pluginRoutes[p.plugin].push(p.link);
      } else {
        pluginRoutes[p.plugin] = [p.link];
      }
    } else {
      if (pluginRoutes[`${p.plugin}_admin`]) {
        pluginRoutes[`${p.plugin}_admin`].push(p.link);
      } else {
        pluginRoutes[`${p.plugin}_admin`] = [p.link];
      }
    }
  });
  return pluginRoutes;
};

const Routing: React.FC<RoutingProps & WithStyles<typeof styles>> = (
  props: RoutingProps & WithStyles<typeof styles>
) => {
  const [pluginRoutes, setPluginRoutes] = React.useState(
    getPluginRoutes(props.plugins)
  );

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
        new URL(event.detail.oldUrl).pathname.startsWith(p.link)
      );
      const newPlugin = props.plugins.find((p) =>
        new URL(event.detail.newUrl).pathname.startsWith(p.link)
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
    <div
      className={classNames(props.classes.container, {
        [props.classes.containerShift]: props.drawerOpen,
      })}
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
          exact
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
            const pluginId = key.endsWith('_admin') ? key.slice(0, -6) : key;
            return (
              <Route key={key} path={value}>
                {key.endsWith('_admin') ? (
                  <AuthorisedAdminPlugin id={pluginId} />
                ) : (
                  <AuthorisedPlugin id={pluginId} />
                )}
              </Route>
            );
          })
        )}
        <Route component={withAuth(false)(PageNotFound)} />
      </Switch>
    </div>
  );
};

export const RoutingWithStyles = withStyles(styles)(Routing);

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

export default connect(mapStateToProps)(RoutingWithStyles);
