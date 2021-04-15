import React, { Component, ComponentType, NamedExoticComponent } from 'react';
import { Redirect } from 'react-router-dom';
import { StateType, AuthState, AuthProvider } from '../state/state.types';
import { connect } from 'react-redux';
import LoadingAuthProvider from '../authentication/loadingAuthProvider';
import { Action, Dispatch } from 'redux';
import {
  invalidToken,
  requestPluginRerender,
} from '../state/actions/scigateway.actions';

interface WithAuthStateProps {
  loading: boolean;
  loggedIn: boolean;
  provider: AuthProvider;
  location: string;
  startUrlState?: StateType;
  homepageUrlState?: StateType;
}

interface WithAuthDispatchProps {
  requestPluginRerender: () => Action;
  invalidToken: () => Action;
}

type WithAuthProps = WithAuthStateProps & WithAuthDispatchProps;

const isStartingUpOrLoading = (auth: AuthState): boolean =>
  auth.provider instanceof LoadingAuthProvider || auth.loading;

const mapStateToProps = (state: StateType): WithAuthStateProps => ({
  loading:
    state.scigateway.siteLoading ||
    isStartingUpOrLoading(state.scigateway.authorisation),
  loggedIn: state.scigateway.authorisation.provider.isLoggedIn(),
  provider: state.scigateway.authorisation.provider,
  location: state.router.location.pathname,
  startUrlState: state.router.location.state,
  homepageUrlState: state.router.location.state,
});

const mapDispatchToProps = (dispatch: Dispatch): WithAuthDispatchProps => ({
  requestPluginRerender: () => dispatch(requestPluginRerender()),
  invalidToken: () => dispatch(invalidToken()),
});

// generator function to create an authentication layer around the given component
export default function withAuth<T>(
  ComponentToProtect: ComponentType<T>
): NamedExoticComponent<T> {
  class WithAuthComponent extends Component<WithAuthProps> {
    public componentDidMount(): void {
      if (!this.props.loading) {
        // Needed for when an authorised route is accessed after loading has completed
        this.props.provider.verifyLogIn().catch(() => {
          this.props.invalidToken();
        });
      }
    }

    public render(): React.ReactElement {
      const {
        loading,
        loggedIn,
        location,
        provider,
        startUrlState,
        requestPluginRerender,
        invalidToken,
        ...componentProps
      } = this.props;
      return (
        <div>
          {!loading && !loggedIn ? (
            <Redirect
              push
              to={{
                pathname: '/login',
                state: { referrer: location },
              }}
            />
          ) : null}
          {/* If using a plugin as the start page, redirect here so the plugin renders with the redirected url */}
          {!loading && loggedIn ? (
            startUrlState && startUrlState.scigateway.startUrl ? (
              <Redirect
                push
                to={{ pathname: startUrlState.scigateway.startUrl }}
              />
            ) : (
              <ComponentToProtect {...(componentProps as T)} />
            )
          ) : null}
        </div>
      );
    }

    public componentDidUpdate(prevProps: WithAuthProps): void {
      const { props } = this;
      if (!props.loading && prevProps.loading) {
        props.provider.verifyLogIn().catch(() => {
          props.invalidToken();
        });
      }

      if (
        (props.loggedIn && prevProps.loading && !props.loading) ||
        (!props.loading && !prevProps.loggedIn && props.loggedIn)
      ) {
        props.requestPluginRerender();
      }
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(WithAuthComponent);
}
