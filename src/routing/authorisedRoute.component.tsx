import React, { ComponentType } from 'react';
import { Redirect } from 'react-router-dom';
import { StateType, AuthState } from '../state/state.types';
import { useSelector } from 'react-redux';
import LoadingAuthProvider from '../authentication/loadingAuthProvider';
import {
  invalidToken,
  requestPluginRerender,
} from '../state/actions/scigateway.actions';
import PageNotFound from '../pageNotFound/pageNotFound.component';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router';

const isStartingUpOrLoading = (auth: AuthState): boolean =>
  auth.provider instanceof LoadingAuthProvider || auth.loading;

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>();
  React.useEffect(() => {
    ref.current = value; //assign the value of ref to the argument
  }, [value]); //this code will run when the value of 'value' changes
  return ref.current; //in the end, return the current ref value.
}

// generator function to create an authentication layer around the given component
const withAuth =
  (adminSection: boolean) =>
  <T,>(ComponentToProtect: ComponentType<T>): ComponentType<T> => {
    const WithAuthComponent = (props: T): React.ReactElement => {
      const dispatch = useDispatch();
      const loading = useSelector(
        (state: StateType) =>
          state.scigateway.siteLoading ||
          isStartingUpOrLoading(state.scigateway.authorisation)
      );
      const loggedIn = useSelector((state: StateType) =>
        state.scigateway.authorisation.provider.isLoggedIn()
      );
      const userIsAdmin = useSelector((state: StateType) =>
        state.scigateway.authorisation.provider.isAdmin()
      );
      const provider = useSelector(
        (state: StateType) => state.scigateway.authorisation.provider
      );
      const homepageUrl = useSelector(
        (state: StateType) => state.scigateway.homepageUrl
      );
      const { pathname: location } = useLocation();

      const prevLoading = usePrevious(loading);
      const prevLoggedIn = usePrevious(loggedIn);

      React.useEffect(() => {
        // run either on initial mount i.e. prevLoading is undefined
        // or when the loading state changes i.e. prevLoading was true and loading is now false
        if (!loading && (typeof prevLoading === 'undefined' || prevLoading)) {
          provider.verifyLogIn().catch(() => {
            dispatch(invalidToken());
          });
        }
      }, [dispatch, loading, prevLoading, provider]);

      React.useEffect(() => {
        if (
          typeof prevLoading !== 'undefined' &&
          typeof prevLoggedIn !== 'undefined' &&
          ((loggedIn && prevLoading && !loading) ||
            (!loading && !prevLoggedIn && loggedIn))
        ) {
          dispatch(requestPluginRerender());
        }
      }, [dispatch, loading, loggedIn, prevLoading, prevLoggedIn]);

      return (
        <div>
          {!loading ? (
            !loggedIn ? (
              homepageUrl && location === homepageUrl ? (
                <ComponentToProtect {...props} />
              ) : (
                <Redirect
                  to={{
                    pathname: '/login',
                    state: { referrer: location },
                  }}
                />
              )
            ) : /* If using a plugin as the start page, redirect here so the plugin renders with the redirected url */
            !adminSection || (adminSection && userIsAdmin) ? (
              <ComponentToProtect {...props} />
            ) : (
              <PageNotFound />
            )
          ) : (
            <PageNotFound />
          )}
        </div>
      );
    };

    return WithAuthComponent;
  };

export default withAuth;
