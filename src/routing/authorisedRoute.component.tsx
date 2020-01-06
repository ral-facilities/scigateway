import React, { Component, ComponentType } from 'react';
import { Redirect } from 'react-router-dom';
import { StateType, AuthState } from '../state/state.types';
import { AnyAction, Dispatch } from 'redux';
import { requestPluginRerender } from '../state/actions/scigateway.actions';
import { connect } from 'react-redux';
import LoadingAuthProvider from '../authentication/loadingAuthProvider';

interface WithAuthProps {
  loading: boolean;
  loggedIn: boolean;
  location: string;
}

interface WithAuthDispatchProps {
  requestPluginRerender: () => AnyAction;
}

const isStartingUpOrLoading = (auth: AuthState): boolean =>
  auth.provider instanceof LoadingAuthProvider || auth.loading;

const mapStateToProps = (state: StateType): WithAuthProps => ({
  loading: isStartingUpOrLoading(state.scigateway.authorisation),
  loggedIn: state.scigateway.authorisation.provider.isLoggedIn(),
  location: state.router.location.pathname,
});

const mapDispatchToProps = (dispatch: Dispatch): WithAuthDispatchProps => ({
  requestPluginRerender: () => dispatch(requestPluginRerender()),
});

// generator function to create an authentication layer around the given component
export default function withAuth(
  ComponentToProtect: ComponentType
): ComponentType {
  class WithAuthComponent extends Component<
    WithAuthProps & WithAuthDispatchProps
  > {
    public componentDidMount(): void {
      this.props.requestPluginRerender();
    }

    public render(): React.ReactElement {
      const { props } = this;
      return (
        <div>
          {!props.loading && !props.loggedIn ? (
            <Redirect
              push
              to={{
                pathname: '/login',
                state: { referrer: props.location },
              }}
            />
          ) : null}
          {!props.loading && props.loggedIn ? (
            <ComponentToProtect {...this.props} />
          ) : null}
        </div>
      );
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(WithAuthComponent);
}
