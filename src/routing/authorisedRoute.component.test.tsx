import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import {
  RenderResult,
  act,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import {
  BrowserRouter,
  RouterProvider,
  createBrowserRouter,
} from 'react-router';
import {
  AnyAction,
  applyMiddleware,
  combineReducers,
  createStore,
} from 'redux';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import LoadingAuthProvider from '../authentication/loadingAuthProvider';
import TestAuthProvider from '../authentication/testAuthProvider';
import {
  invalidToken,
  requestPluginRerender,
  siteLoadingUpdate,
  verifyUsernameAndPassword,
} from '../state/actions/scigateway.actions';
import scigatewayReducer, {
  authState,
  initialState,
} from '../state/reducers/scigateway.reducer';
import { SignOutType } from '../state/scigateway.types';
import { StateType } from '../state/state.types';
import { flushPromises } from '../testUtils';
import { buildTheme } from '../theming';
import withAuth from './authorisedRoute.component';

describe('AuthorisedRoute component', () => {
  let state: StateType;
  const ComponentToProtect = (): React.ReactElement => (
    <div>protected component</div>
  );
  const theme = buildTheme(false);

  beforeEach(() => {
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
    };
    window.history.replaceState(null, '', '/');
  });

  const renderComponent = ({
    admin,
    componentToProtect,
  }: {
    admin: boolean;
    componentToProtect: React.ComponentType;
  }): RenderResult & {
    router: ReturnType<typeof createBrowserRouter>;
    testStore: MockStoreEnhanced<StateType>;
  } => {
    const mockStore = configureStore<StateType, AnyAction>();
    const testStore = mockStore(state);
    const AuthorisedComponent = withAuth(admin)(componentToProtect);
    const router = createBrowserRouter([
      // use / instead of * to ensure we unmount when we redirect
      { path: '/', element: <AuthorisedComponent /> },
      { path: '/login', element: <></> },
    ]);

    const view = render(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={testStore}>
            <RouterProvider router={router} />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );

    return {
      router,
      testStore: testStore,
      ...view,
    };
  };

  const renderComponentWithRealStore = ({
    admin,
    componentToProtect,
  }: {
    admin: boolean;
    componentToProtect: React.ComponentType;
  }): RenderResult & {
    dispatch: (action: unknown) => void;
    getDispatchedActions: () => unknown[];
    getState: () => StateType;
    clearDispatchedActions: () => void;
  } => {
    let actions = [];
    const observerMiddleware = () => (next) => (action) => {
      actions.push(action);
      return next(action);
    };

    const store = createStore(
      combineReducers<StateType>({
        scigateway: scigatewayReducer,
      }),
      state,
      applyMiddleware(thunk, observerMiddleware)
    );

    const utils = {
      dispatch(action) {
        return store.dispatch(action);
      },
      getDispatchedActions() {
        return actions;
      },
      getState() {
        return store.getState();
      },
      clearDispatchedActions() {
        actions = [];
      },
    };

    const AuthorisedComponent = withAuth(admin)(componentToProtect);

    const view = render(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <Provider store={store}>
              <AuthorisedComponent />
            </Provider>
          </BrowserRouter>
        </ThemeProvider>
      </StyledEngineProvider>
    );

    return {
      ...view,
      ...utils,
    };
  };

  it('renders non admin component when admin user accesses it', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );

    renderComponent({ admin: false, componentToProtect: ComponentToProtect });

    expect(screen.getByText('protected component')).toBeInTheDocument();
  });

  it('renders non admin component when non admin user accesses it', () => {
    const testAuthProvider = new TestAuthProvider('test-token');
    testAuthProvider.isAdmin = vi.fn().mockImplementation(() => false);
    state.scigateway.authorisation.provider = testAuthProvider;
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;

    renderComponent({ admin: false, componentToProtect: ComponentToProtect });

    expect(screen.getByText('protected component')).toBeInTheDocument();
  });

  it('renders admin component when admin user accesses it', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );

    renderComponent({ admin: true, componentToProtect: ComponentToProtect });

    expect(screen.getByText('protected component')).toBeInTheDocument();
  });

  it('renders PageNotFound component when non admin user accesses admin component', () => {
    const testAuthProvider = new TestAuthProvider('test-token');
    testAuthProvider.isAdmin = vi.fn().mockImplementation(() => false);
    state.scigateway.authorisation.provider = testAuthProvider;
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;

    renderComponent({ admin: true, componentToProtect: ComponentToProtect });

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders redirect when user not logged in and stores referrer in router state', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider(null);

    const { router } = renderComponent({
      admin: false,
      componentToProtect: ComponentToProtect,
    });

    expect(window.location.pathname).toBe('/login');
    expect(router.state.location.state).toEqual({
      referrer: '/',
      referredFrom: 'authorisedRoute',
    });
    expect(screen.queryByText('protected component')).not.toBeInTheDocument();
  });

  it('renders PageNotFound component when site is loading due to LoadingAuthProvider', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new LoadingAuthProvider();

    renderComponent({ admin: false, componentToProtect: ComponentToProtect });

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders PageNotFound component when site is loading due to loading prop', () => {
    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = true;

    renderComponent({ admin: false, componentToProtect: ComponentToProtect });

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders PageNotFound component when site is loading due to siteLoading prop', () => {
    state.scigateway.siteLoading = true;

    renderComponent({ admin: false, componentToProtect: ComponentToProtect });

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('dispatches requestPluginRerender action when loading or logged in state changes', async () => {
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );
    state.scigateway.authorisation.provider.verifyLogIn = vi
      .fn()
      .mockResolvedValue(undefined);

    const { dispatch, clearDispatchedActions, getDispatchedActions } =
      renderComponentWithRealStore({
        admin: false,
        componentToProtect: ComponentToProtect,
      });

    act(() => {
      dispatch(siteLoadingUpdate(false));
    });

    await waitFor(() =>
      expect(getDispatchedActions()).toContainEqual(requestPluginRerender())
    );
    clearDispatchedActions();

    act(() => {
      dispatch({ type: SignOutType });
    });
    act(() => {
      dispatch(verifyUsernameAndPassword('username', 'password'));
    });

    await waitFor(() =>
      expect(getDispatchedActions()).toContainEqual(requestPluginRerender())
    );
  });

  it('dispatches invalidToken when token fails verification', async () => {
    const testAuthProvider = new TestAuthProvider('token');

    state.scigateway.siteLoading = false;
    state.scigateway.authorisation.loading = false;
    state.scigateway.authorisation.provider = testAuthProvider;

    const { testStore } = renderComponent({
      admin: false,
      componentToProtect: ComponentToProtect,
    });

    await flushPromises();

    expect(testStore.getActions().length).toEqual(1);
    expect(testStore.getActions()[0]).toEqual(invalidToken());
  });
});
