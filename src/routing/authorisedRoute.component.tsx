import React, { Component, ComponentType } from 'react';
import { Redirect } from 'react-router-dom';
import { StateType, AuthState } from '../state/state.types';
import { connect } from 'react-redux';
import LoadingAuthProvider from '../authentication/loadingAuthProvider';

interface WithAuthProps {
  loading: boolean;
  loggedIn: boolean;
  location: string;
}

const isStartingUpOrLoading = (auth: AuthState): boolean =>
  auth.provider instanceof LoadingAuthProvider || auth.loading;

const mapStateToProps = (state: StateType): WithAuthProps => ({
  loading: isStartingUpOrLoading(state.scigateway.authorisation),
  loggedIn: state.scigateway.authorisation.provider.isLoggedIn(),
  location: state.router.location.pathname,
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
  }

  return connect(mapStateToProps)(WithAuthComponent);
}
