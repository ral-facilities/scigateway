import * as React from 'react';
import { Route, Switch } from 'react-router';
import { StateType } from './state/state.types';
import { PluginConfig } from './state/daaas.types';
import { connect } from 'react-redux';
import LoginPage from './loginPage/loginPage.component';

interface RoutingProps {
  plugins: PluginConfig[];
  location: string;
}

class Routing extends React.Component<RoutingProps> {
  public render(): React.ReactNode {
    const { plugins } = this.props;

    return (
      <Switch>
        {plugins.map(p => {
          console.log(`Adding Route: ${p.link} ${p.displayName}`);
          return (
            <Route
              key={`${p.section}_${p.link}`}
              path={p.link}
              render={() => <div id={p.plugin}>{p.displayName}</div>}
            />
          );
        })}
        <Route exact_path="/login" component={LoginPage} />
        <Route exact path="/" render={() => <div>Match</div>} />
        <Route render={() => <div>Miss</div>} />
      </Switch>
    );
  }
}

const mapStateToProps = (state: StateType): RoutingProps => ({
  plugins: state.daaas.plugins,
  location: state.router.location.pathname,
});

export default connect(mapStateToProps)(Routing);
