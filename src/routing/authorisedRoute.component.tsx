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
import PageNotFound from '../pageNotFound/pageNotFound.component';

interface WithAuthStateProps {
  loading: boolean;
  loggedIn: boolean;
  userIsAdmin: boolean;
  provider: AuthProvider;
  location: string;
  homepageUrl?: string;
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
  userIsAdmin: state.scigateway.authorisation.provider.isAdmin(),
  provider: state.scigateway.authorisation.provider,
  location: state.router.location.pathname,
  homepageUrl: state.scigateway.homepageUrl,
});

const mapDispatchToProps = (dispatch: Dispatch): WithAuthDispatchProps => ({
  requestPluginRerender: () => dispatch(requestPluginRerender()),
  invalidToken: () => dispatch(invalidToken()),
});

// generator function to create an authentication layer around the given component
const withAuth =
  (adminSection: boolean) =>
  <T,>(ComponentToProtect: ComponentType<T>): NamedExoticComponent<T> => {
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
          userIsAdmin,
          location,
          provider,
          homepageUrl,
          requestPluginRerender,
          invalidToken,
          ...componentProps
        } = this.props;

        return (
          <div>
            {!loading &&
              (!loggedIn ? (
                homepageUrl && location === homepageUrl ? (
                  <ComponentToProtect {...(componentProps as T)} />
                ) : (
                  <div>
                    <Redirect
                      push
                      to={{
                        pathname: '/login',
                        state: { referrer: location },
                      }}
                    />
                  </div>
                )
              ) : /* If using a plugin as the start page, redirect here so the plugin renders with the redirected url */
              !adminSection || (adminSection && userIsAdmin) ? (
                <ComponentToProtect {...(componentProps as T)} />
              ) : (
                <PageNotFound />
              ))}
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
  };

export default withAuth;
