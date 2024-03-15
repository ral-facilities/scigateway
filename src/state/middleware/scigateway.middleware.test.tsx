import ScigatewayMiddleware, {
  listenToPlugins,
  autoLoginMiddleware,
} from './scigateway.middleware';
import { AnyAction } from 'redux';
import configureStore, {
  MockStoreCreator,
  MockStoreEnhanced,
} from 'redux-mock-store';
import log from 'loglevel';
import { createLocation } from 'history';
import {
  InvalidateTokenType,
  ToggleDrawerType,
  LoadDarkModePreferenceType,
  SendThemeOptionsType,
  BroadcastSignOutType,
  LoadHighContrastModePreferenceType,
  SignOutType,
  AuthFailureType,
  NotificationType,
  TokenRefreshedType,
} from '../scigateway.types';
import { toastr } from 'react-redux-toastr';
import { AddHelpTourStepsType } from '../scigateway.types';
import { StateType } from '../state.types';
import TestAuthProvider from '../../authentication/testAuthProvider';
import { flushPromises } from '../../setupTests';
import { authState, initialState } from '../reducers/scigateway.reducer';
import { buildTheme } from '../../theming';
import { thunk } from 'redux-thunk';
import { autoLoginAuthorised } from '../actions/scigateway.actions';
import * as singleSpa from 'single-spa';
import { Mock } from 'vitest';

vi.mock('single-spa');

describe('scigateway middleware', () => {
  let events: CustomEvent<AnyAction>[] = [];
  let handler: (event: Event) => void;
  let store: MockStoreEnhanced<StateType>;
  const mockStore: MockStoreCreator<StateType> = configureStore([thunk]);
  const getState: () => StateType = () => ({
    scigateway: { ...initialState, authorisation: { ...authState } },
    router: {
      action: 'POP',
      location: createLocation('/'),
    },
  });

  const theme = buildTheme(false);

  const action = {
    type: 'scigateway:api:test-action',
    payload: {
      broadcast: true,
    },
  };

  const registerRouteAction = {
    type: 'scigateway:api:register_route',
    payload: {
      section: 'Analysis',
      link: '/plugin1/analysis2',
      plugin: 'demo_plugin',
      displayName: 'Demo Plugin Analysis',
      order: 4,
      broadcast: false,
    },
  };

  const sendThemeOptionsAction = {
    type: 'scigateway:api:send_themeoptions',
    payload: {
      theme,
      broadcast: true,
    },
  };

  const requestPluginRerenderAction = {
    type: 'scigateway:api:plugin_rerender',
    payload: {
      broadcast: true,
    },
  };

  const loadDarkModePreferenceAction = {
    type: LoadDarkModePreferenceType,
    payload: {
      darkMode: false,
    },
  };

  const broadcastSignOutAction = {
    type: BroadcastSignOutType,
  };

  const loadHighContrastModePreferenceAction = {
    type: LoadHighContrastModePreferenceType,
    payload: {
      highContrastMode: false,
    },
  };

  beforeEach(() => {
    events = [];
    handler = () => {
      // to be defined
    };

    document.dispatchEvent = (e: Event) => {
      events.push(e as CustomEvent<AnyAction>);
      return true;
    };

    document.addEventListener = vi.fn(
      (_id: string, inputHandler: (event: Event) => void) => {
        handler = inputHandler;
      }
    );

    store = mockStore(getState());

    Storage.prototype.getItem = vi.fn(() => 'false');
  });

  describe('autoLoginMiddleware', () => {
    let autoLogin: Mock;
    beforeEach(() => {
      autoLogin = vi.fn(() => Promise.resolve());
      store = mockStore({
        ...getState(),
        scigateway: {
          ...getState().scigateway,
          authorisation: {
            ...getState().scigateway.authorisation,
            provider: {
              ...getState().scigateway.authorisation.provider,
              autoLogin,
            },
          },
        },
      });
    });
    beforeEach(() => {
      autoLogin.mockClear();
    });

    it('auto logs in when SignOut action sent', async () => {
      autoLoginMiddleware(store)(store.dispatch)({ type: SignOutType });

      expect(autoLogin).toHaveBeenCalled();
      await flushPromises();
      expect(store.getActions().length).toEqual(2);
      expect(store.getActions()[1]).toEqual(autoLoginAuthorised());
    });

    it('auto logs in when AuthFailure action sent', async () => {
      autoLoginMiddleware(store)(store.dispatch)({ type: AuthFailureType });

      expect(autoLogin).toHaveBeenCalled();
      await flushPromises();
      expect(store.getActions().length).toEqual(2);
      expect(store.getActions()[1]).toEqual(autoLoginAuthorised());
    });

    it('auto logs in when InvalidateToken action sent', async () => {
      autoLoginMiddleware(store)(store.dispatch)({ type: InvalidateTokenType });

      expect(autoLogin).toHaveBeenCalled();
      await flushPromises();
      expect(store.getActions().length).toEqual(2);
      expect(store.getActions()[1]).toEqual(autoLoginAuthorised());
    });

    it('sends an error notification if autoLogin fails', async () => {
      log.error = vi.fn();

      autoLogin = vi.fn(() => Promise.reject());
      store = mockStore({
        ...getState(),
        scigateway: {
          ...getState().scigateway,
          authorisation: {
            ...getState().scigateway.authorisation,
            provider: {
              ...getState().scigateway.authorisation.provider,
              autoLogin,
            },
          },
        },
      });

      autoLoginMiddleware(store)(store.dispatch)({ type: SignOutType });

      expect(autoLogin).toHaveBeenCalled();

      await flushPromises();

      expect(store.getActions().length).toEqual(1);

      expect(log.error).toHaveBeenCalled();
      const mockLog = vi.mocked(log.error).mock;
      expect(mockLog.calls[0][0]).toEqual('Auto Login via middleware failed');

      expect(events.length).toEqual(1);
      expect(events[0].detail).toEqual({
        type: NotificationType,
        payload: { severity: 'error', message: 'auto-login-error-msg' },
      });
    });

    it('does nothing when random action sent', () => {
      autoLoginMiddleware(store)(store.dispatch)({ type: 'test' });

      expect(autoLogin).not.toHaveBeenCalled();
    });

    it('does nothing when no autoLogin function is defined', () => {
      store = mockStore({
        ...getState(),
        scigateway: {
          ...getState().scigateway,
          authorisation: {
            ...getState().scigateway.authorisation,
            provider: {
              ...getState().scigateway.authorisation.provider,
            },
          },
        },
      });

      autoLoginMiddleware(store)(store.dispatch)({ type: SignOutType });

      expect(autoLogin).not.toHaveBeenCalled();
    });
  });

  it('should broadcast messages with broadcast flag', () => {
    ScigatewayMiddleware(store)(store.dispatch)(action);

    expect(events.length).toEqual(1);
    expect(events[0].detail).toEqual(action);
  });

  it('should not broadcast messages without broadcast flag', () => {
    ScigatewayMiddleware(store)(store.dispatch)({ type: 'test', payload: {} });
    expect(events.length).toEqual(0);
  });

  it('should not broadcast messages without payload', () => {
    ScigatewayMiddleware(store)(store.dispatch)({ type: 'test' });
    expect(events.length).toEqual(0);
  });

  it("should not send page views if analytics haven't been initialised", () => {
    store = mockStore({
      scigateway: {},
    });
    ScigatewayMiddleware(store)(store.dispatch)({
      type: '@@router/LOCATION_CHANGE',
      payload: {
        location: createLocation('/'),
        action: 'POP',
      },
    });
  });

  it('should send request plugin rerender action when ToggleDrawer action is sent', () => {
    const toggleDrawerAction = {
      type: ToggleDrawerType,
    };
    ScigatewayMiddleware(store)(store.dispatch)(toggleDrawerAction);

    expect(store.getActions().length).toEqual(2);
    expect(store.getActions()[0]).toEqual(toggleDrawerAction);
    expect(store.getActions()[1]).toEqual(requestPluginRerenderAction);
  });

  it('should send theme options and request plugin rerender actions when LoadDarkModePreferenceType action is sent', () => {
    store = mockStore({
      scigateway: initialState,
    });
    ScigatewayMiddleware(store)(store.dispatch)(loadDarkModePreferenceAction);

    expect(store.getActions().length).toEqual(3);
    expect(store.getActions()[0]).toEqual(loadDarkModePreferenceAction);
    expect(JSON.stringify(store.getActions()[1])).toEqual(
      JSON.stringify(sendThemeOptionsAction)
    );
    expect(store.getActions()[2]).toEqual(requestPluginRerenderAction);
  });

  it('should send theme options and request plugin rerender actions when LoadHighContrastModePreferenceType action is sent', () => {
    store = mockStore({
      scigateway: initialState,
    });
    ScigatewayMiddleware(store)(store.dispatch)(
      loadHighContrastModePreferenceAction
    );

    expect(store.getActions().length).toEqual(3);
    expect(store.getActions()[0]).toEqual(loadHighContrastModePreferenceAction);
    expect(JSON.stringify(store.getActions()[1])).toEqual(
      JSON.stringify(sendThemeOptionsAction)
    );
    expect(store.getActions()[2]).toEqual(requestPluginRerenderAction);
  });

  it('should send dark theme options when LoadDarkModePreferenceType action is sent and darkmode preference is true', () => {
    store = mockStore({
      scigateway: initialState,
    });

    const loadDarkModePreferenceAction = {
      type: LoadDarkModePreferenceType,
      payload: {
        darkMode: true,
      },
    };

    const theme = buildTheme(true);

    const sendThemeOptionsAction = {
      type: SendThemeOptionsType,
      payload: {
        theme,
        broadcast: true,
      },
    };
    ScigatewayMiddleware(store)(store.dispatch)(loadDarkModePreferenceAction);

    expect(store.getActions().length).toEqual(3);
    expect(JSON.stringify(store.getActions()[1])).toEqual(
      JSON.stringify(sendThemeOptionsAction)
    );
  });

  it('should send high contrast theme options when LoadHighContrastModePreferenceType action is sent and high contrast mode preference is true', () => {
    const loadHighContrastModePreferenceAction = {
      type: LoadHighContrastModePreferenceType,
      payload: {
        highContrastMode: true,
      },
    };

    const theme = buildTheme(false, true);

    const sendThemeOptionsAction = {
      type: SendThemeOptionsType,
      payload: {
        theme,
        broadcast: true,
      },
    };
    ScigatewayMiddleware(store)(store.dispatch)(
      loadHighContrastModePreferenceAction
    );

    expect(store.getActions().length).toEqual(3);
    expect(JSON.stringify(store.getActions()[1])).toEqual(
      JSON.stringify(sendThemeOptionsAction)
    );
  });

  it('should extract dark mode value from user preferences & custom primary colour from store', () => {
    const getState: () => StateType = () => ({
      scigateway: {
        ...initialState,
        authorisation: { ...authState },
        primaryColour: '#654321',
      },
      router: {
        action: 'POP',
        location: createLocation('/'),
      },
    });
    Storage.prototype.getItem = vi.fn().mockReturnValueOnce(undefined);
    window.matchMedia = vi.fn().mockReturnValueOnce({ matches: true });
    const theme = buildTheme(true, false, '#654321');
    const sendThemeOptionsAction = {
      type: SendThemeOptionsType,
      payload: {
        theme,
        broadcast: true,
      },
    };

    listenToPlugins(store.dispatch, getState);

    handler(new CustomEvent('test', { detail: registerRouteAction }));
    expect(window.matchMedia).toHaveBeenCalled();
    expect(JSON.stringify(store.getActions()[1])).toEqual(
      JSON.stringify(sendThemeOptionsAction)
    );
  });

  it('should listen for events and fire registerroute action', () => {
    listenToPlugins(store.dispatch, getState);

    handler(new CustomEvent('test', { detail: registerRouteAction }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(2);
    expect(store.getActions()[0]).toEqual(registerRouteAction);
    expect(JSON.stringify(store.getActions()[1])).toEqual(
      JSON.stringify(sendThemeOptionsAction)
    );
  });

  it('should listen for events and refresh token on invalidateToken message & send token refreshed event', async () => {
    const testAuthProvider = new TestAuthProvider('test');
    const refreshSpy = vi
      .spyOn(testAuthProvider, 'refresh')
      .mockImplementationOnce(() => Promise.resolve());

    const getState: () => StateType = () => ({
      scigateway: {
        ...initialState,
        authorisation: {
          ...initialState.authorisation,
          provider: testAuthProvider,
        },
      },
      router: {
        action: 'POP',
        location: createLocation('/'),
      },
    });

    listenToPlugins(store.dispatch, getState);

    handler(new CustomEvent('test', { detail: { type: InvalidateTokenType } }));
    await flushPromises();

    expect(document.addEventListener).toHaveBeenCalled();
    expect(refreshSpy).toHaveBeenCalled();
    expect(events.length).toEqual(1);
    expect(events[0].detail).toEqual({
      type: TokenRefreshedType,
    });
  });

  it('should listen for events and fires invalidateToken action & notification event on invalidateToken message & failed refresh', async () => {
    listenToPlugins(store.dispatch, getState);

    const notificationPayload = { severity: 'error', message: 'Token error' };

    handler(
      new CustomEvent('test', {
        detail: {
          type: InvalidateTokenType,
          payload: notificationPayload,
        },
      })
    );

    await flushPromises();

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(1);
    expect(store.getActions()[0]).toEqual({
      type: InvalidateTokenType,
      payload: notificationPayload,
    });
    expect(events.length).toEqual(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: notificationPayload,
    });
  });

  it('should listen for events and fire registerroute action and addHelpTourStep action when helpText present', () => {
    listenToPlugins(store.dispatch, getState);

    const registerRouteActionWithHelp = {
      ...registerRouteAction,
      payload: {
        ...registerRouteAction.payload,
        helpText: 'Help text test',
      },
    };

    handler(
      new CustomEvent('test', {
        detail: registerRouteActionWithHelp,
      })
    );

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(3);
    expect(store.getActions()[0]).toEqual(registerRouteActionWithHelp);
    expect(store.getActions()[1]).toEqual({
      type: AddHelpTourStepsType,
      payload: {
        steps: [
          {
            target: '#plugin-link--plugin1-analysis2',
            content: 'Help text test',
          },
        ],
      },
    });
    expect(JSON.stringify(store.getActions()[2])).toEqual(
      JSON.stringify(sendThemeOptionsAction)
    );
  });

  it('should listen for events and fire registerroute action and addHelpTourStep action when helpSteps present', () => {
    listenToPlugins(store.dispatch, getState);

    const registerRouteActionWithHelp = {
      ...registerRouteAction,
      payload: {
        ...registerRouteAction.payload,
        helpSteps: [{ target: 'test-target', content: 'test-content' }],
      },
    };

    handler(
      new CustomEvent('test', {
        detail: registerRouteActionWithHelp,
      })
    );

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(3);
    expect(store.getActions()[0]).toEqual(registerRouteActionWithHelp);
    expect(store.getActions()[1]).toEqual({
      type: AddHelpTourStepsType,
      payload: {
        steps: [
          {
            target: 'test-target',
            content: 'test-content',
          },
        ],
      },
    });
    expect(JSON.stringify(store.getActions()[2])).toEqual(
      JSON.stringify(sendThemeOptionsAction)
    );
  });

  it('should listen for events and fire registerroute action and redirect to homepageUrl', () => {
    const testHomepageUrl = '/plugin1/analysis2';
    const getState: () => StateType = () => ({
      scigateway: { ...initialState, homepageUrl: testHomepageUrl },
      router: {
        action: 'POP',
        location: createLocation('/'),
      },
    });

    listenToPlugins(store.dispatch, getState);

    handler(
      new CustomEvent('test', {
        detail: registerRouteAction,
      })
    );

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(3);
    expect(store.getActions()[0]).toEqual(registerRouteAction);
    expect(store.getActions()[1]).toEqual({
      type: '@@router/CALL_HISTORY_METHOD',
      payload: {
        method: 'push',
        args: [
          testHomepageUrl,
          { scigateway: { homepageUrl: testHomepageUrl } },
        ],
      },
    });
    expect(JSON.stringify(store.getActions()[2])).toEqual(
      JSON.stringify(sendThemeOptionsAction)
    );
  });

  it("should listen for events and fire registerroute action and call singleSpa.triggerAppChange if url matches plugin route and it's not loaded", () => {
    const getState: () => StateType = () => ({
      scigateway: { ...initialState },
      router: {
        action: 'POP',
        location: createLocation('/plugin1/analysis2'),
      },
    });

    vi.mocked(singleSpa.getAppStatus).mockReturnValue(singleSpa.NOT_LOADED);

    listenToPlugins(store.dispatch, getState);

    handler(
      new CustomEvent('test', {
        detail: registerRouteAction,
      })
    );

    expect(singleSpa.triggerAppChange).toHaveBeenCalled();
  });

  describe('notifications', () => {
    it('should listen for notification events and fire notification action even if no severity', () => {
      listenToPlugins(store.dispatch, getState);

      const notificationAction = {
        type: NotificationType,
        payload: {
          message: 'test notification',
        },
      };

      handler(new CustomEvent('test', { detail: notificationAction }));

      expect(document.addEventListener).toHaveBeenCalled();
      expect(store.getActions().length).toEqual(1);
      expect(store.getActions()[0]).toEqual(notificationAction);
    });

    it('should listen for notification events and fire notification action for success event', () => {
      listenToPlugins(store.dispatch, getState);

      const notificationAction = {
        type: NotificationType,
        payload: {
          message: 'test notification',
          severity: 'success',
        },
      };

      handler(new CustomEvent('test', { detail: notificationAction }));

      expect(document.addEventListener).toHaveBeenCalled();
      expect(store.getActions().length).toEqual(1);
      expect(store.getActions()[0]).toEqual(notificationAction);
    });

    it('should listen for notification events and create toast for error', () => {
      toastr.error = vi.fn();
      listenToPlugins(store.dispatch, getState);

      const notificationAction = {
        type: NotificationType,
        payload: {
          message: 'test notification',
          severity: 'error',
        },
      };

      handler(new CustomEvent('test', { detail: notificationAction }));

      expect(toastr.error).toHaveBeenCalled();
      const mockToastr = vi.mocked(toastr.error).mock;
      expect(mockToastr.calls[0][0]).toContain('Error');
      expect(mockToastr.calls[0][1]).toContain('test notification');
    });

    it('should listen for notification events and create toast for warning', () => {
      toastr.warning = vi.fn();
      listenToPlugins(store.dispatch, getState);

      const notificationAction = {
        type: NotificationType,
        payload: {
          message: 'test notification',
          severity: 'warning',
        },
      };
      handler(new CustomEvent('test', { detail: notificationAction }));

      expect(toastr.warning).toHaveBeenCalled();
      const mockToastr = vi.mocked(toastr.warning).mock;
      expect(mockToastr.calls[0][0]).toContain('Warning');
      expect(mockToastr.calls[0][1]).toContain('test notification');
    });

    it('should listen for notification events and create toast for information', () => {
      toastr.info = vi.fn();
      listenToPlugins(store.dispatch, getState);

      const notificationAction = {
        type: NotificationType,
        payload: {
          message: 'test notification',
          severity: 'information',
        },
      };
      handler(new CustomEvent('test', { detail: notificationAction }));

      expect(toastr.info).toHaveBeenCalled();
      const mockToastr = vi.mocked(toastr.info).mock;
      expect(mockToastr.calls[0][0]).toContain('Information');
      expect(mockToastr.calls[0][1]).toContain('test notification');
    });

    it('should listen for notification events and log error for invalid severity', () => {
      log.error = vi.fn();
      listenToPlugins(store.dispatch, getState);

      const notificationAction = {
        type: NotificationType,
        payload: {
          message: 'test notification',
          severity: 'invalid',
        },
      };
      handler(new CustomEvent('test', { detail: notificationAction }));

      expect(log.error).toHaveBeenCalled();
      const mockLog = vi.mocked(log.error).mock;
      expect(mockLog.calls[0][0]).toContain(
        'Invalid severity provided: invalid'
      );
    });
  });

  it('should broadcast requestpluginrerender action but ignore it itself', () => {
    log.warn = vi.fn();
    const mockLog = vi.mocked(log.warn).mock;

    listenToPlugins(store.dispatch, getState);

    ScigatewayMiddleware(store)(store.dispatch)(requestPluginRerenderAction);
    expect(store.getActions().length).toEqual(1);
    expect(events.length).toEqual(1);
    expect(events[0].detail).toEqual(requestPluginRerenderAction);

    handler(new CustomEvent('test', { detail: requestPluginRerenderAction }));
    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(1);
    expect(mockLog.calls.length).toBe(0);
  });

  it('should ignore BroadcastSignOut ', () => {
    log.warn = vi.fn();
    const mockLog = vi.mocked(log.warn).mock;

    listenToPlugins(store.dispatch, getState);
    expect(document.addEventListener).toHaveBeenCalled();

    handler(new CustomEvent('test', { detail: broadcastSignOutAction }));
    expect(mockLog.calls.length).toBe(0);
  });

  it('should listen for events and not fire unrecognised action', () => {
    log.warn = vi.fn();
    listenToPlugins(store.dispatch, getState);

    handler(new CustomEvent('test', { detail: action }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(0);

    expect(log.warn).toHaveBeenCalled();
    const mockLog = vi.mocked(log.warn).mock;
    expect(mockLog.calls[0][0]).toContain(
      'Unexpected message received from plugin, not dispatched'
    );
  });

  it('should not fire actions for events without detail', () => {
    log.error = vi.fn();

    listenToPlugins(store.dispatch, getState);

    handler(new CustomEvent('test', { detail: undefined }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(0);

    expect(log.error).toHaveBeenCalled();
    const mockLog = vi.mocked(log.error).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Invalid message received from a plugin:\nevent.detail = null'
    );
  });

  it('should not fire actions for events without type on detail', () => {
    log.error = vi.fn();

    listenToPlugins(store.dispatch, getState);

    handler(new CustomEvent('test', { detail: { actionWithoutType: true } }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(0);

    expect(log.error).toHaveBeenCalled();
    const mockLog = vi.mocked(log.error).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Invalid message received from a plugin:\nevent.detail = {"actionWithoutType":true}'
    );
  });
});
