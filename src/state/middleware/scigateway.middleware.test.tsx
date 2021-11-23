import ScigatewayMiddleware, { listenToPlugins } from './scigateway.middleware';
import { AnyAction } from 'redux';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import log from 'loglevel';
import ReactGA from 'react-ga';
import { createLocation } from 'history';
import {
  InvalidateTokenType,
  ToggleDrawerType,
  LoadDarkModePreferenceType,
  SendThemeOptionsType,
  SignOutType,
} from '../scigateway.types';
import { toastr } from 'react-redux-toastr';
import { AddHelpTourStepsType } from '../scigateway.types';
import { StateType } from '../state.types';
import TestAuthProvider from '../../authentication/testAuthProvider';
import { flushPromises } from '../../setupTests';
import { authState, initialState } from '../reducers/scigateway.reducer';
import { buildTheme } from '../../theming';

describe('scigateway middleware', () => {
  let events: CustomEvent<AnyAction>[] = [];
  let handler: (event: Event) => void;
  let store: MockStoreEnhanced;
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

  const signOutAction = {
    type: SignOutType,
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

    document.addEventListener = jest.fn(
      (id: string, inputHandler: (event: Event) => void) => {
        handler = inputHandler;
      }
    );

    const mockStore = configureStore();
    store = mockStore({});
    ReactGA.initialize('test id', { testMode: true, titleCase: false });

    Storage.prototype.getItem = jest.fn(() => 'false');
  });

  afterEach(() => {
    ReactGA.testModeAPI.resetCalls();
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
    store = configureStore()({
      scigateway: {},
    });
    ScigatewayMiddleware(store)(store.dispatch)({
      type: '@@router/LOCATION_CHANGE',
      payload: {
        location: createLocation('/'),
        action: 'POP',
      },
    });

    expect(ReactGA.testModeAPI.calls.length).toEqual(1);
  });

  it('should send page views on location change event', () => {
    store = configureStore()({
      scigateway: { analytics: { id: 'test id', initialised: true } },
    });

    ScigatewayMiddleware(store)(store.dispatch)({
      type: '@@router/LOCATION_CHANGE',
      payload: {
        location: createLocation('/'),
        action: 'POP',
      },
    });

    expect(ReactGA.testModeAPI.calls[1][0]).toEqual('set');
    expect(ReactGA.testModeAPI.calls[1][1]).toEqual({
      page: '/',
    });
    expect(ReactGA.testModeAPI.calls[2][0]).toEqual('send');
    expect(ReactGA.testModeAPI.calls[2][1]).toEqual({
      hitType: 'pageview',
      page: '/',
    });
  });

  it("should not send page views on location change event when location hasn't changed", () => {
    store = configureStore()({
      scigateway: { analytics: { id: 'test id', initialised: true } },
    });

    ScigatewayMiddleware(store)(store.dispatch)({
      type: '@@router/LOCATION_CHANGE',
      payload: {
        location: createLocation('/newlocation'),
        action: 'POP',
      },
    });
    ScigatewayMiddleware(store)(store.dispatch)({
      type: '@@router/LOCATION_CHANGE',
      payload: {
        location: createLocation('/newlocation'),
        action: 'POP',
      },
    });

    expect(ReactGA.testModeAPI.calls.length).toEqual(3);
  });

  it('should also send request plugin rerender action when ToggleDrawer action is sent', () => {
    const toggleDrawerAction = {
      type: ToggleDrawerType,
    };
    ScigatewayMiddleware(store)(store.dispatch)(toggleDrawerAction);

    expect(store.getActions().length).toEqual(2);
    expect(store.getActions()[0]).toEqual(toggleDrawerAction);
    expect(store.getActions()[1]).toEqual(requestPluginRerenderAction);
  });

  it('should send theme options and request plugin rerender actions when LoadDarkModePreferenceType action is sent', () => {
    ScigatewayMiddleware(store)(store.dispatch)(loadDarkModePreferenceAction);

    expect(store.getActions().length).toEqual(3);
    expect(store.getActions()[0]).toEqual(loadDarkModePreferenceAction);
    expect(JSON.stringify(store.getActions()[1])).toEqual(
      JSON.stringify(sendThemeOptionsAction)
    );
    expect(store.getActions()[2]).toEqual(requestPluginRerenderAction);
  });

  it('should send dark theme options when LoadDarkModePreferenceType action is sent and darkmode preference is true', () => {
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

  it('should extract dark mode value from user preferences', () => {
    Storage.prototype.getItem = jest.fn().mockReturnValueOnce(undefined);
    window.matchMedia = jest.fn().mockReturnValueOnce({ matches: true });
    const theme = buildTheme(true);
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

  it('should listen for events and refresh token on invalidateToken message', async () => {
    const testAuthProvider = new TestAuthProvider('test');
    const refreshSpy = jest
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
  });

  it('should listen for events and fire invalidateToken action on invalidateToken message', async () => {
    listenToPlugins(store.dispatch, getState);

    handler(new CustomEvent('test', { detail: { type: InvalidateTokenType } }));

    await flushPromises();

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(1);
    expect(store.getActions()[0]).toEqual({ type: InvalidateTokenType });
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

  describe('notifications', () => {
    it('should listen for notification events and fire notification action even if no severity', () => {
      listenToPlugins(store.dispatch, getState);

      const notificationAction = {
        type: 'scigateway:api:notification',
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
        type: 'scigateway:api:notification',
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
      toastr.error = jest.fn();
      listenToPlugins(store.dispatch, getState);

      const notificationAction = {
        type: 'scigateway:api:notification',
        payload: {
          message: 'test notification',
          severity: 'error',
        },
      };

      handler(new CustomEvent('test', { detail: notificationAction }));

      expect(toastr.error).toHaveBeenCalled();
      const mockToastr = (toastr.error as jest.Mock).mock;
      expect(mockToastr.calls[0][0]).toContain('Error');
      expect(mockToastr.calls[0][1]).toContain('test notification');
    });

    it('should listen for notification events and create toast for warning', () => {
      toastr.warning = jest.fn();
      listenToPlugins(store.dispatch, getState);

      const notificationAction = {
        type: 'scigateway:api:notification',
        payload: {
          message: 'test notification',
          severity: 'warning',
        },
      };
      handler(new CustomEvent('test', { detail: notificationAction }));

      expect(toastr.warning).toHaveBeenCalled();
      const mockToastr = (toastr.warning as jest.Mock).mock;
      expect(mockToastr.calls[0][0]).toContain('Warning');
      expect(mockToastr.calls[0][1]).toContain('test notification');
    });
  });

  it('should broadcast requestpluginrerender action but ignore it itself', () => {
    log.warn = jest.fn();
    const mockLog = (log.warn as jest.Mock).mock;

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

  it('should ignore SignOut broadcasts', () => {
    log.error = jest.fn();
    const mockLog = (log.error as jest.Mock).mock;

    listenToPlugins(store.dispatch, getState);
    expect(document.addEventListener).toHaveBeenCalled();

    handler(new CustomEvent('test', { detail: signOutAction }));
    expect(mockLog.calls.length).toBe(0);
  });

  it('should listen for events and not fire unrecognised action', () => {
    log.warn = jest.fn();
    listenToPlugins(store.dispatch, getState);

    handler(new CustomEvent('test', { detail: action }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(0);

    expect(log.warn).toHaveBeenCalled();
    const mockLog = (log.warn as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toContain(
      'Unexpected message received from plugin, not dispatched'
    );
  });

  it('should not fire actions for events without detail', () => {
    log.error = jest.fn();

    listenToPlugins(store.dispatch, getState);

    handler(new CustomEvent('test', { detail: undefined }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(0);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Invalid message received from a plugin:\nevent.detail = null'
    );
  });

  it('should not fire actions for events without type on detail', () => {
    log.error = jest.fn();

    listenToPlugins(store.dispatch, getState);

    handler(new CustomEvent('test', { detail: { actionWithoutType: true } }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(0);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Invalid message received from a plugin:\nevent.detail = {"actionWithoutType":true}'
    );
  });
});
