import React, { Component, ComponentType } from 'react';
import { Redirect } from 'react-router-dom';
import { StateType, AuthState } from '../state/state.types';
import { connect } from 'react-redux';
import LoadingAuthProvider from '../authentication/loadingAuthProvider';
import { Action, Dispatch } from 'redux';
import { requestPluginRerender } from '../state/actions/scigateway.actions';

interface WithAuthStateProps {
  loading: boolean;
  loggedIn: boolean;
  location: string;
}

interface WithAuthDispatchProps {
  requestPluginRerender: () => Action;
}

type WithAuthProps = WithAuthStateProps & WithAuthDispatchProps;

const isStartingUpOrLoading = (auth: AuthState): boolean =>
  auth.provider instanceof LoadingAuthProvider || auth.loading;

const mapStateToProps = (state: StateType): WithAuthStateProps => ({
  loading:
    state.scigateway.siteLoading ||
    isStartingUpOrLoading(state.scigateway.authorisation),
  loggedIn: state.scigateway.authorisation.provider.isLoggedIn(),
  location: state.router.location.pathname,
});

const mapDispatchToProps = (dispatch: Dispatch): WithAuthDispatchProps => ({
  requestPluginRerender: () => dispatch(requestPluginRerender()),
});

// generator function to create an authentication layer around the given component
export default function withAuth<T>(
  ComponentToProtect: ComponentType<T>
): ComponentType<T> {
  class WithAuthComponent extends Component<WithAuthProps> {
    public render(): React.ReactElement {
      const { loading, loggedIn, location, ...componentProps } = this.props;
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
          {!loading && loggedIn ? (
            <ComponentToProtect {...(componentProps as T)} />
          ) : null}
        </div>
      );
    }

    public componentDidUpdate(prevProps: WithAuthProps): void {
      const { props } = this;
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
