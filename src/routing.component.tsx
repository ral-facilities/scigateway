import * as React from 'react';
import { Route, Switch } from 'react-router';
import { StateType, AuthState } from './state/state.types';
import { PluginConfig } from './state/daaas.types';
import { connect } from 'react-redux';
import HomePage from './homePage/homePage.component';
import LoginPage from './loginPage/loginPage.component';
import PageNotFound from './pageNotFound/pageNotFound.component';

interface RoutingProps {
  plugins: PluginConfig[];
  location: string;
  authorisation: AuthState;
}

class Routing extends React.Component<RoutingProps> {
  public render(): React.ReactNode {
    const { plugins, authorisation } = this.props;
    const authorised = authorisation.loggedIn;
    return (
      // If a user is authorised, redirect to the URL they attempted to navigate to e.g. "/plugin"
      // Otherwise render the login component. Successful logins will continue to the requested
      // route, otherwise they will continue to be prompted to log in.
      // "/" is always accessible
      <Switch>
        <Route exact path="/" component={HomePage} />
        {authorised &&
          plugins.map(p => {
            console.log(`Adding Route: ${p.link} ${p.displayName}`);
            return (
              <Route
                key={`${p.section}_${p.link}`}
                path={p.link}
                render={() => <div id={p.plugin}>{p.displayName}</div>}
              />
            );
          })}
        <Route component={authorised ? PageNotFound : LoginPage} />
      </Switch>
    );
  }
}

const mapStateToProps = (state: StateType): RoutingProps => ({
  plugins: state.daaas.plugins,
  location: state.router.location.pathname,
  authorisation: state.daaas.authorisation,
});

export default connect(mapStateToProps)(Routing);
