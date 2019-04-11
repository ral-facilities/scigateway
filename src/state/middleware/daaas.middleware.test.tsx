import DaaasMiddleware, { listenToPlugins } from './daaas.middleware';
import { AnyAction } from 'redux';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import loglevel from 'loglevel';

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

  it('should listen for events and fire registerroute action', () => {
    listenToPlugins(store.dispatch);

    handler(new CustomEvent('test', { detail: registerRouteAction }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(1);
    expect(store.getActions()[0]).toEqual(registerRouteAction);
  });

  it('should listen for events and not fire unrecognised action', () => {
    loglevel.warn = jest.fn();
    listenToPlugins(store.dispatch);

    handler(new CustomEvent('test', { detail: action }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(0);

    expect(loglevel.warn).toHaveBeenCalled();
    const mockLoglevel = (loglevel.warn as jest.Mock).mock;
    expect(mockLoglevel.calls[0][0]).toContain(
      'Unexpected message received from plugin, not dispatched'
    );
  });

  it('should not fire actions for events without detail', () => {
    loglevel.error = jest.fn();

    listenToPlugins(store.dispatch);

    handler(new CustomEvent('test', { detail: undefined }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(0);

    expect(loglevel.error).toHaveBeenCalled();
    const mockLoglevel = (loglevel.error as jest.Mock).mock;
    expect(mockLoglevel.calls[0][0]).toEqual(
      'Invalid message received from a plugin:\nevent.detail = null'
    );
  });

  it('should not fire actions for events without type on detail', () => {
    loglevel.error = jest.fn();

    listenToPlugins(store.dispatch);

    handler(new CustomEvent('test', { detail: { actionWithoutType: true } }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(0);

    expect(loglevel.error).toHaveBeenCalled();
    const mockLoglevel = (loglevel.error as jest.Mock).mock;
    expect(mockLoglevel.calls[0][0]).toEqual(
      'Invalid message received from a plugin:\nevent.detail = {"actionWithoutType":true}'
    );
  });
});
