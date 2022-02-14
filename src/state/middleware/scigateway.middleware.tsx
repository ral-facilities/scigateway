import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux';
import {
  NotificationType,
  RegisterRouteType,
  InvalidateTokenType,
  RequestPluginRerenderType,
  ToggleDrawerType,
  SendThemeOptionsType,
  LoadDarkModePreferenceType,
  BroadcastSignOutType,
  LoadHighContrastModePreferenceType,
  AuthFailureType,
  SignOutType,
} from '../scigateway.types';
import log from 'loglevel';
import { toastr } from 'react-redux-toastr';
import {
  addHelpTourSteps,
  requestPluginRerender,
  sendThemeOptions,
  autoLoginAuthorised,
} from '../actions/scigateway.actions';
import ReactGA from 'react-ga';
import { StateType } from '../state.types';
import { buildTheme } from '../../theming';
import { push } from 'connected-react-router';
import { ThunkDispatch } from 'redux-thunk';

const trackPage = (page: string): void => {
  ReactGA.set({
    page,
  });
  ReactGA.pageview(page);
};

let currentPage = '';

const microFrontendMessageId = 'scigateway';

const broadcastToPlugins = (action: AnyAction): void => {
  document.dispatchEvent(
    new CustomEvent(microFrontendMessageId, { detail: action })
  );
};

type microFrontendMessageType = CustomEvent<AnyAction>;

const toastrMessageOptions = {
  removeOnHover: false,
  removeOnHoverTimeOut: 0,
};

const toastrMessage = (
  message: string,
  severity: 'success' | 'warning' | 'error'
): void => {
  switch (severity) {
    case 'success':
      toastr.success('Success', message, toastrMessageOptions);
      break;
    case 'warning':
      toastr.warning('Warning', message, toastrMessageOptions);
      break;
    case 'error':
      toastr.error('Error', message, toastrMessageOptions);
      break;
    default:
      log.error(`Invalid severity provided: ${severity}`);
  }
};

export const listenToPlugins = (
  dispatch: Dispatch,
  getState: () => StateType
): void => {
  document.addEventListener(microFrontendMessageId, (event) => {
    const pluginMessage = event as microFrontendMessageType;

    if (
      pluginMessage.detail &&
      pluginMessage.detail.type &&
      pluginMessage.detail.type.startsWith('scigateway:api:')
    ) {
      // this is a valid message, send to Redux in the parent app
      switch (pluginMessage.detail.type) {
        case RequestPluginRerenderType:
          //ignore events sent from the parent app
          break;

        case SendThemeOptionsType:
          break;

        case BroadcastSignOutType:
          break;

        case RegisterRouteType:
          dispatch(pluginMessage.detail);
          if ('helpSteps' in pluginMessage.detail.payload) {
            dispatch(addHelpTourSteps(pluginMessage.detail.payload.helpSteps));
          } else if ('helpText' in pluginMessage.detail.payload) {
            dispatch(
              addHelpTourSteps([
                {
                  target: `#plugin-link-${pluginMessage.detail.payload.link.replace(
                    /\//g,
                    '-'
                  )}`,
                  content: pluginMessage.detail.payload.helpText,
                },
              ])
            );
          }

          if (
            // Redirect to homepage if one is set and current path is /
            getState().router.location.pathname === '/' &&
            getState().scigateway.homepageUrl ===
              pluginMessage.detail.payload.link
          ) {
            dispatch(
              push(pluginMessage.detail.payload.link, {
                scigateway: { homepageUrl: pluginMessage.detail.payload.link },
              })
            );
          }

          let darkModePreference: boolean;
          const darkModeLocalStorage = localStorage.getItem('darkMode');
          if (darkModeLocalStorage) {
            darkModePreference = darkModeLocalStorage === 'true' ? true : false;
          } else {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            darkModePreference = mq.matches;
          }
          const highContrastModePreference: boolean =
            localStorage.getItem('highContrastMode') === 'true' ? true : false;

          const theme = buildTheme(
            darkModePreference,
            highContrastModePreference
          );
          // Send theme options once registered.
          dispatch(sendThemeOptions(theme));

          break;

        case NotificationType:
          // Only add to state if it is not intended to be an "instant" notification.
          if (
            pluginMessage.detail.payload.instant !== undefined &&
            pluginMessage.detail.payload.instant === true
          ) {
            if (pluginMessage.detail.payload.severity !== undefined) {
              const { severity, message } = pluginMessage.detail.payload;
              toastrMessage(message, severity);
            }
          } else {
            dispatch(pluginMessage.detail);

            // If "instant" is not used, by default we only show "warning" and "error" messages.
            if (pluginMessage.detail.payload.severity !== undefined) {
              const { severity, message } = pluginMessage.detail.payload;

              if (severity !== 'success') {
                toastrMessage(message, severity);
              }
            }
          }
          break;
        case InvalidateTokenType:
          getState()
            .scigateway.authorisation.provider.refresh()
            .catch(() => dispatch(pluginMessage.detail));
          break;
        default:
          // log and ignore
          log.warn(
            `Unexpected message received from plugin, not dispatched:\nevent.detail = ${JSON.stringify(
              pluginMessage.detail
            )}`
          );
      }
    } else {
      log.error(
        `Invalid message received from a plugin:\nevent.detail = ${JSON.stringify(
          pluginMessage.detail
        )}`
      );
    }
  });
};

const ScigatewayMiddleware: Middleware = ((
    store: MiddlewareAPI<Dispatch<AnyAction>, StateType>
  ) =>
  (next: Dispatch<AnyAction>) =>
  (action: AnyAction): AnyAction => {
    const state = store.getState();

    if (action.payload && action.payload.broadcast) {
      broadcastToPlugins(action);
    }

    if (
      action.type === '@@router/LOCATION_CHANGE' &&
      state.scigateway.analytics &&
      state.scigateway.analytics.initialised
    ) {
      const nextPage = `${action.payload.location.pathname}${action.payload.location.search}`;

      if (currentPage !== nextPage) {
        currentPage = nextPage;
        trackPage(nextPage);
      }
    }

    if (action.type === ToggleDrawerType) {
      next(action);
      return store.dispatch(requestPluginRerender());
    }

    if (action.type === LoadDarkModePreferenceType) {
      next(action);
      const theme = buildTheme(
        action.payload.darkMode,
        state.scigateway.highContrastMode
      );
      store.dispatch(sendThemeOptions(theme));
      return store.dispatch(requestPluginRerender());
    }

    if (action.type === LoadHighContrastModePreferenceType) {
      next(action);
      const theme = buildTheme(
        state.scigateway.darkMode,
        action.payload.highContrastMode
      );
      store.dispatch(sendThemeOptions(theme));
      return store.dispatch(requestPluginRerender());
    }

    return next(action);
  }) as Middleware;

export const autoLoginMiddleware: Middleware<
  ThunkDispatch<StateType, void, AnyAction>,
  StateType,
  ThunkDispatch<StateType, void, AnyAction>
> =
  ({ dispatch, getState }) =>
  (next) =>
  async (action) => {
    const autoLogin = getState().scigateway.authorisation.provider.autoLogin;
    if (
      autoLogin &&
      // these are the three actions that can cause a user sign out
      (action.type === SignOutType ||
        action.type === AuthFailureType ||
        action.type === InvalidateTokenType)
    ) {
      next(action);
      return await autoLogin().then(() => {
        dispatch(autoLoginAuthorised());
      });
    }

    return next(action);
  };

export default ScigatewayMiddleware;
