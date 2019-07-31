import DaaasMiddleware, { listenToPlugins } from './daaas.middleware';
import { AnyAction } from 'redux';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import log from 'loglevel';
import ReactGA from 'react-ga';
import { createLocation } from 'history';

describe('daaas middleware', () => {
  let events: CustomEvent<AnyAction>[] = [];
  let handler: (event: Event) => void;
  let store: MockStoreEnhanced;

  const action = {
    type: 'daaas:api:test-action',
    payload: {
      broadcast: true,
    },
  };

  const registerRouteAction = {
    type: 'daaas:api:register_route',
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
    type: 'daaas:api:plugin_rerender',
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
    ReactGA.initialize('test id', { testMode: true, titleCase: false });
  });

  afterEach(() => {
    ReactGA.testModeAPI.resetCalls();
  });

  it('should broadcast messages with broadcast flag', () => {
    DaaasMiddleware(store)(store.dispatch)(action);

    expect(events.length).toEqual(1);
    expect(events[0].detail).toEqual(action);
  });

  it('should not broadcast messages without broadcast flag', () => {
    DaaasMiddleware(store)(store.dispatch)({ type: 'test', payload: {} });
    expect(events.length).toEqual(0);
  });

  it('should not broadcast messages without payload', () => {
    DaaasMiddleware(store)(store.dispatch)({ type: 'test' });
    expect(events.length).toEqual(0);
  });

  it("should not send page views if analytics haven't been initialised", () => {
    store = configureStore()({
      daaas: {},
    });
    DaaasMiddleware(store)(store.dispatch)({
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
      daaas: { analytics: { id: 'test id', initialised: true } },
    });

    DaaasMiddleware(store)(store.dispatch)({
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
      daaas: { analytics: { id: 'test id', initialised: true } },
    });

    DaaasMiddleware(store)(store.dispatch)({
      type: '@@router/LOCATION_CHANGE',
      payload: {
        location: createLocation('/newlocation'),
        action: 'POP',
      },
    });
    DaaasMiddleware(store)(store.dispatch)({
      type: '@@router/LOCATION_CHANGE',
      payload: {
        location: createLocation('/newlocation'),
        action: 'POP',
      },
    });

    expect(ReactGA.testModeAPI.calls.length).toEqual(3);
  });

  it('should listen for events and fire registerroute action', () => {
    listenToPlugins(store.dispatch);

    handler(new CustomEvent('test', { detail: registerRouteAction }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(1);
    expect(store.getActions()[0]).toEqual(registerRouteAction);
  });

  it('should broadcast requestpluginrerender action but ignore it itself', () => {
    log.warn = jest.fn();
    const mockLog = (log.warn as jest.Mock).mock;

    listenToPlugins(store.dispatch);
    DaaasMiddleware(store)(store.dispatch)(requestPluginRerenderAction);

    expect(events.length).toEqual(1);
    expect(events[0].detail).toEqual(requestPluginRerenderAction);

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
