import * as React from 'react';
import { Route, Switch } from 'react-router';
import { StateType, AuthState } from './state/state.types';
import { RegisterRoutePayload } from './state/daaas.types';
import { connect } from 'react-redux';
import LoginPage from './loginPage/loginPage.component';
import PageNotFound from './pageNotFound/pageNotFound.component';

interface RoutingProps {
  plugins: RegisterRoutePayload[];
  location: string;
  authorisation: AuthState;
}

class Routing extends React.Component<RoutingProps> {
  public render(): React.ReactNode {
    const { plugins, authorisation } = this.props;
    const authorised = authorisation.loggedIn;
    return (
      <Switch>
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
        <Route exact path="/" render={() => <div>Match</div>} />
        <Route render={() => (authorised ? <PageNotFound /> : <LoginPage />)} />
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
