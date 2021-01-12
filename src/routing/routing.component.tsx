import React from 'react';
import {
  withStyles,
  createStyles,
  Theme,
  StyleRules,
  WithStyles,
} from '@material-ui/core/styles';
import { Route, Switch } from 'react-router';
import { StateType } from '../state/state.types';
import { PluginConfig } from '../state/scigateway.types';
import { connect } from 'react-redux';
import HomePage from '../homePage/homePage.component';
import ContactPage from '../contactPage/contactPage.component';
import HelpPage from '../helpPage/helpPage.component';
import LoginPage from '../loginPage/loginPage.component';
import CookiesPage from '../cookieConsent/cookiesPage.component';
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
}

export class PluginPlaceHolder extends React.PureComponent<{ id: string }> {
  public render(): React.ReactNode {
    const { id } = this.props;
    return <div id={id}>{id} failed to load correctly</div>;
  }
}

export const AuthorisedPlugin = withAuth(PluginPlaceHolder);

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
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/contact" component={ContactPage} />
          <Route exact path="/help" component={HelpPage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/cookies" component={CookiesPage} />
          {this.props.plugins.map((p) => (
            <Route
              key={`${p.section}_${p.link}`}
              path={p.link}
              render={() => <AuthorisedPlugin id={p.plugin} />}
            />
          ))}
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
});

export default connect(mapStateToProps)(RoutingWithStyles);
