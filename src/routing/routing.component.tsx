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
import ContactPage from '../contactPage/contactPage.component';
import HelpPage from '../helpPage/helpPage.component';
import LoginPage from '../loginPage/loginPage.component';
import CookiesPage from '../cookieConsent/cookiesPage.component';
import MaintenancePage from '../maintenancePage/maintenancePage.component';
import AdminPage from '../adminPage/adminPage.component';
import PageNotFound from '../pageNotFound/pageNotFound.component';
import classNames from 'classnames';
import { UKRITheme } from '../theming';
import withAuth from './authorisedRoute.component';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    container: {
      paddingBottom: '30px',
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
}

export class PluginPlaceHolder extends React.PureComponent<{
  id: string;
  adminPlugin: boolean;
}> {
  public render(): React.ReactNode {
    const { id } = this.props;
    return <div id={id}>{id} failed to load correctly</div>;
  }
}

export const AuthorisedPlugin = withAuth(PluginPlaceHolder);
// Prevents the component from updating when the draw is opened/ closed
export const AuthorisedAdminPage = withAuth(AdminPage);

class Routing extends React.Component<
  RoutingProps & WithStyles<typeof styles>
> {
  public render(): React.ReactNode {
    return (
      // If a user is authorised, redirect to the URL they attempted to navigate to e.g. "/plugin"
      // Otherwise render the login component. Successful logins will continue to the requested
      // route, otherwise they will continue to be prompted to log in.
      // "/" is always accessible
      <div
        className={classNames(this.props.classes.container, {
          [this.props.classes.containerShift]: this.props.drawerOpen,
        })}
      >
        {/* Redirect to a homepageUrl if set. Otherwise, route to / */}
        <Switch>
          <Route exact path={scigatewayRoutes.home}>
            {this.props.homepageUrl && this.props.homepageUrl !== '/' ? (
              <Redirect to={this.props.homepageUrl} />
            ) : (
              <HomePage />
            )}
          </Route>
          <Route
            exact
            path={scigatewayRoutes.contact}
            component={ContactPage}
          />
          <Route exact path={scigatewayRoutes.help} component={HelpPage} />
          {/* Admin check required because the component does not have an adminPlugin prop */}
          {this.props.userIsAdmin && (
            <Route
              exact
              path={scigatewayRoutes.admin}
              render={() => <AuthorisedAdminPage />}
            />
          )}
          <Route exact path={scigatewayRoutes.login}>
            {!this.props.userIsloggedIn ? (
              <LoginPage />
            ) : (
              <Redirect to={scigatewayRoutes.home} />
            )}
          </Route>
          <Route
            exact
            path={scigatewayRoutes.cookies}
            component={CookiesPage}
          />
          {/* Only display maintenance page to non-admin users when site under maintenance */}
          {this.props.maintenance.show && !this.props.userIsAdmin ? (
            <Route component={MaintenancePage} />
          ) : (
            this.props.plugins.map((p) => (
              <Route
                key={`${p.section}_${p.link}`}
                path={p.link}
                render={() => (
                  <AuthorisedPlugin
                    id={p.plugin}
                    adminPlugin={p.admin ? p.admin : false}
                  />
                )}
              />
            ))
          )}
          <Route component={withAuth(PageNotFound)} />
        </Switch>
      </div>
    );
  }
}

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
});

export default connect(mapStateToProps)(RoutingWithStyles);
