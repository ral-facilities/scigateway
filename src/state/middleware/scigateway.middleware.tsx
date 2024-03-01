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
  TokenRefreshedType,
} from '../scigateway.types';
import log from 'loglevel';
import { toastr } from 'react-redux-toastr';
import {
  addHelpTourSteps,
  requestPluginRerender,
  sendThemeOptions,
  autoLoginAuthorised,
} from '../actions/scigateway.actions';
import { StateType } from '../state.types';
import { buildTheme } from '../../theming';
import { push } from 'connected-react-router';
import { ThunkDispatch } from 'redux-thunk';
import * as singleSpa from 'single-spa';
import { getAppStrings, getString } from '../strings';

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
  severity: 'success' | 'warning' | 'error' | 'information'
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
    case 'information':
      toastr.info('Information', message, toastrMessageOptions);
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

        case TokenRefreshedType:
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
                  target: `#plugin-link-${pluginMessage.detail.payload.link
                    .split('?')[0]
                    .replace(/\//g, '-')}`,
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

          // this helps prevent problems if the plugin settings files and thus routes are loaded particularly slowly
          if (
            getState().router.location.pathname.startsWith(
              pluginMessage.detail.payload.link.split('?')[0]
            ) &&
            singleSpa.getAppStatus(pluginMessage.detail.payload.plugin) ===
              singleSpa.NOT_LOADED
          ) {
            singleSpa.triggerAppChange();
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
            highContrastModePreference,
            getState().scigateway.primaryColour
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
              const { severity, message, show } = pluginMessage.detail.payload;

              if (!show && severity !== 'success') {
                toastrMessage(message, severity);
              } else if (show === 'true') {
                toastrMessage(message, severity);
              }
            }
          }
          break;
        case InvalidateTokenType:
          getState()
            .scigateway.authorisation.provider.refresh()
            .then(() => {
              document.dispatchEvent(
                new CustomEvent(microFrontendMessageId, {
                  detail: {
                    type: TokenRefreshedType,
                  },
                })
              );
            })
            .catch(() => {
              dispatch(pluginMessage.detail);
              // if there's an error message in the token invalidation event then broadcast it
              if (pluginMessage.detail.payload) {
                document.dispatchEvent(
                  new CustomEvent(microFrontendMessageId, {
                    detail: {
                      type: NotificationType,
                      payload: pluginMessage.detail.payload,
                    },
                  })
                );
              }
            });
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

    if (action.type === ToggleDrawerType) {
      next(action);
      return store.dispatch(requestPluginRerender());
    }

    if (action.type === LoadDarkModePreferenceType) {
      next(action);
      const theme = buildTheme(
        action.payload.darkMode,
        state.scigateway.highContrastMode,
        state.scigateway.primaryColour
      );
      store.dispatch(sendThemeOptions(theme));
      return store.dispatch(requestPluginRerender());
    }

    if (action.type === LoadHighContrastModePreferenceType) {
      next(action);
      const theme = buildTheme(
        state.scigateway.darkMode,
        action.payload.highContrastMode,
        state.scigateway.primaryColour
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
    const state = getState();
    const autoLogin = state.scigateway.authorisation.provider.autoLogin;
    const res = getAppStrings(state, 'login');
    if (
      autoLogin &&
      // these are the three actions that can cause a user sign out
      (action.type === SignOutType ||
        action.type === AuthFailureType ||
        action.type === InvalidateTokenType)
    ) {
      next(action);
      return await autoLogin()
        .then(() => {
          dispatch(autoLoginAuthorised());
        })
        .catch(() => {
          log.error('Auto Login via middleware failed');
          // we can't recover from here - tell user they'll need to refresh the page or login again
          document.dispatchEvent(
            new CustomEvent(microFrontendMessageId, {
              detail: {
                type: NotificationType,
                payload: {
                  severity: 'error',
                  message: getString(res, 'auto-login-error-msg'),
                },
              },
            })
          );
        });
    }

    return next(action);
  };

export default ScigatewayMiddleware;
