import ScigatewayMiddleware, { listenToPlugins } from './scigateway.middleware';
import { AnyAction } from 'redux';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import log from 'loglevel';
import { InvalidateTokenType } from '../daaas.types';
import { toastr } from 'react-redux-toastr';
import { AddHelpTourStepsType } from '../scigateway.types';

describe('scigateway middleware', () => {
  let events: CustomEvent<AnyAction>[] = [];
  let handler: (event: Event) => void;
  let store: MockStoreEnhanced;

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

  const requestPluginRerenderAction = {
    type: 'scigateway:api:plugin_rerender',
    payload: {
      broadcast: true,
    },
  };

  beforeEach(() => {
    events = [];
    handler = () => {};

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

  it('should listen for events and fire registerroute action', () => {
    listenToPlugins(store.dispatch);

    handler(new CustomEvent('test', { detail: registerRouteAction }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(1);
    expect(store.getActions()[0]).toEqual(registerRouteAction);
  });

  it('should listen for events and fire invalidateToken action', () => {
    listenToPlugins(store.dispatch);

    handler(new CustomEvent('test', { detail: { type: InvalidateTokenType } }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(1);
    expect(store.getActions()[0]).toEqual({ type: InvalidateTokenType });
  });

  it('should listen for events and fire registerroute action and addHelpTourStep action when helpText present', () => {
    listenToPlugins(store.dispatch);

    let registerRouteActionWithHelp = {
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
    expect(store.getActions().length).toEqual(2);
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
  });

  describe('notifications', () => {
    it('should listen for notification events and fire notification action even if no severity', () => {
      listenToPlugins(store.dispatch);

      let notificationAction = {
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
      listenToPlugins(store.dispatch);

      let notificationAction = {
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
      listenToPlugins(store.dispatch);

      let notificationAction = {
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
      listenToPlugins(store.dispatch);

      let notificationAction = {
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

    listenToPlugins(store.dispatch);

    ScigatewayMiddleware(store)(store.dispatch)(requestPluginRerenderAction);
    expect(store.getActions().length).toEqual(1);
    expect(events.length).toEqual(1);
    expect(events[0].detail).toEqual(requestPluginRerenderAction);

    handler(new CustomEvent('test', { detail: requestPluginRerenderAction }));
    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(1);
    expect(mockLog.calls.length).toBe(0);
  });

  it('should listen for events and not fire unrecognised action', () => {
    log.warn = jest.fn();
    listenToPlugins(store.dispatch);

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

    listenToPlugins(store.dispatch);

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

    listenToPlugins(store.dispatch);

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
