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
import { RegisterRoutePayload } from './state/daaas.types';
import { connect } from 'react-redux';
import LoginPage from './loginPage/loginPage.component';
import classNames from 'classnames';

const drawerWidth = 240;
const styles = (theme: Theme): StyleRules =>
  createStyles({
    container: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    containerShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  });

interface RoutingProps {
  plugins: RegisterRoutePayload[];
  location: string;
  drawerOpen: boolean;
}

class Routing extends React.Component<
  RoutingProps & WithStyles<typeof styles>
> {
  public render(): React.ReactNode {
    const { plugins } = this.props;

    return (
      <div
        className={classNames(this.props.classes.container, {
          [this.props.classes.containerShift]: this.props.drawerOpen,
        })}
      >
        <Switch>
          {plugins.map(p => (
            <Route
              key={`${p.section}_${p.link}`}
              path={p.link}
              render={() => <div id={p.plugin}>{p.displayName}</div>}
            />
          ))}
          <Route exact_path="/login" component={LoginPage} />
          <Route exact path="/" render={() => <div>Match</div>} />
          <Route render={() => <div>Miss</div>} />
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
