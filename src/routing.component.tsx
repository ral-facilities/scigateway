import * as React from 'react';
import {
  withStyles,
  createStyles,
  Theme,
  StyleRules,
  WithStyles,
} from '@material-ui/core/styles';
import { Route, Switch } from 'react-router';
import { StateType } from './state/state.types';
import { PluginConfig } from './state/daaas.types';
import { connect } from 'react-redux';
import HomePage from './homePage/homePage.component';
import LoginPage from './loginPage/loginPage.component';
import CookiesPage from './cookieConsent/cookiesPage.component';
import PageNotFound from './pageNotFound/pageNotFound.component';
import classNames from 'classnames';
import { UKRITheme } from './theming';
import withAuth from './authorisedRoute.component';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    container: {
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

/* eslint-disable-next-line react/display-name */
const PluginPlaceHolder = (id: string): (() => React.ReactElement) => () => (
  <div id={id}>{id} failed to load correctly</div>
);

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
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/cookies" component={CookiesPage} />
          {this.props.plugins.map(p => (
            <Route
              key={`${p.section}_${p.link}`}
              path={p.link}
              component={withAuth(PluginPlaceHolder(p.plugin))}
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
  plugins: state.daaas.plugins,
  location: state.router.location.pathname,
  drawerOpen: state.daaas.drawerOpen,
});

export default connect(mapStateToProps)(RoutingWithStyles);
