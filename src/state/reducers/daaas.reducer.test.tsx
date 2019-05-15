import log from 'loglevel';
import {
  toggleDrawer,
  authorised,
  unauthorised,
  loadingAuthentication,
  dismissMenuItem,
  toggleHelp,
} from '../actions/daaas.actions';
import DaaasReducer, { initialState } from './daaas.reducer';
import { SignOutType, TokenExpiredType } from '../daaas.types';
import { DaaasState } from '../state.types';
import TestAuthProvider from '../../authentication/testAuthProvider';

describe('daaas reducer', () => {
  let state: DaaasState;

  beforeEach(() => {
    state = initialState;
  });

  it('should return state for actions it does not care about', () => {
    const updatedState = DaaasReducer(state, { type: 'irrelevant action' });

    expect(updatedState).toBe(state);
  });

  it('should toggle the drawer state for a toggleDrawer message', () => {
    expect(state.drawerOpen).toBeFalsy();

    let updatedState = DaaasReducer(state, toggleDrawer());
    expect(updatedState.drawerOpen).toBeTruthy();

    updatedState = DaaasReducer(updatedState, toggleDrawer());
    expect(updatedState.drawerOpen).toBeFalsy();
  });

  it('should toggle the showHelp state for a toggleHelp message', () => {
    expect(state.showHelp).toBeFalsy();

    let updatedState = DaaasReducer(state, toggleHelp());
    expect(updatedState.showHelp).toBeTruthy();

    updatedState = DaaasReducer(updatedState, toggleHelp());
    expect(updatedState.showHelp).toBeFalsy();
  });

  it('loading authentication should update loading state', () => {
    const action = loadingAuthentication();
    expect(state.authorisation.loading).toBeFalsy();

    let updatedState = DaaasReducer(state, action);
    expect(updatedState.authorisation.loading).toBeTruthy();
  });

  it('successful log in should reset failure flags', () => {
    const action = authorised();
    state.authorisation.provider = new TestAuthProvider(null);

    let updatedState = DaaasReducer(state, action);

    expect(updatedState.authorisation.failedToLogin).toBeFalsy();
    expect(updatedState.authorisation.signedOutDueToTokenExpiry).toBeFalsy();
    expect(updatedState.authorisation.loading).toBeFalsy();
  });

  it('unsuccessful log in should update authorisation to not logged in state', () => {
    const action = unauthorised();
    state.authorisation.provider = new TestAuthProvider('logged in');

    let updatedState = DaaasReducer(state, action);

    expect(updatedState.authorisation.failedToLogin).toBeTruthy();
    expect(updatedState.authorisation.provider.isLoggedIn()).toBeFalsy();
  });

  it('token expiration should reset authorisation and indicate expiration', () => {
    const action = { type: TokenExpiredType };
    state.authorisation.provider = new TestAuthProvider('logged in');

    let updatedState = DaaasReducer(state, action);

    expect(updatedState.authorisation.signedOutDueToTokenExpiry).toBeTruthy();
    expect(updatedState.authorisation.provider.isLoggedIn()).toBeFalsy();
  });

  it('should sign user out for a signOut message', () => {
    state.authorisation.provider = new TestAuthProvider('signed in');
    expect(state.authorisation.provider.isLoggedIn()).toBeTruthy();

    let updatedState = DaaasReducer(state, { type: SignOutType });

    expect(updatedState.authorisation.provider.isLoggedIn()).toBeFalsy();
    expect(updatedState.authorisation.failedToLogin).toBeFalsy();
    expect(updatedState.authorisation.loading).toBeFalsy();
    expect(updatedState.authorisation.signedOutDueToTokenExpiry).toBeFalsy();
  });

  it('dismissNotification should remove the referenced notification from the notifications list in State', () => {
    const action = dismissMenuItem(2);
    const notificationsInState = {
      notifications: [
        { message: 'message 1', severity: 'warning' },
        { message: 'message 2', severity: 'error' },
        { message: 'message 3', severity: 'success' },
        { message: 'message 4', severity: 'success' },
      ],
    };

    let updatedState = DaaasReducer(notificationsInState, action);
    const updatedNotificationsInState = [
      { message: 'message 1', severity: 'warning' },
      { message: 'message 2', severity: 'error' },
      { message: 'message 4', severity: 'success' },
    ];

    expect(updatedState.notifications).toEqual(updatedNotificationsInState);
  });

  describe('register route', () => {
    const basePayload = {
      section: 'dummy-section',
      link: 'initial/route',
      plugin: 'demo_plugin',
      displayName: 'Route Label',
      order: 10,
    };
    const registerRouteAction = 'daaas:api:register_route';

    it('should register a plugin in State', () => {
      const action = {
        type: 'daaas:api:register_route',
        payload: basePayload,
      };
      const updatedState = DaaasReducer(state, action);

      expect(updatedState.plugins).toEqual([
        {
          section: action.payload.section,
          link: action.payload.link,
          plugin: action.payload.plugin,
          displayName: action.payload.displayName,
          order: action.payload.order,
        },
      ]);
    });

    it('should register plugin with duplicate displayname and section data in State', () => {
      const baseAction = {
        type: registerRouteAction,
        payload: basePayload,
      };
      const initialPluginState = DaaasReducer(state, baseAction);
      const updatedState = DaaasReducer(initialPluginState, {
        type: registerRouteAction,
        payload: {
          ...basePayload,
          link: 'second/route',
        },
      });

      expect(updatedState.plugins.length).toBe(2);
      expect(updatedState.plugins).toContainEqual({
        section: basePayload.section,
        link: 'second/route',
        plugin: basePayload.plugin,
        displayName: basePayload.displayName,
        order: basePayload.order,
      });
      expect(updatedState.plugins).toContainEqual({
        section: basePayload.section,
        link: basePayload.link,
        plugin: basePayload.plugin,
        displayName: basePayload.displayName,
        order: basePayload.order,
      });
    });

    it('should log error and not register plugin with duplicate route in State', () => {
      log.error = jest.fn();
      const duplicatePayload = {
        ...basePayload,
        displayName: 'Duplicate Route',
      };
      const initialPluginState = DaaasReducer(state, {
        type: 'daaas:api:register_route',
        payload: basePayload,
      });
      const updatedState = DaaasReducer(initialPluginState, {
        type: 'daaas:api:register_route',
        payload: duplicatePayload,
      });

      expect(updatedState.plugins.length).toBe(1);
      expect(updatedState.plugins).toContainEqual({
        section: basePayload.section,
        link: basePayload.link,
        plugin: basePayload.plugin,
        displayName: basePayload.displayName,
        order: basePayload.order,
      });

      expect(log.error).toHaveBeenCalled();
      const mockLog = (log.error as jest.Mock).mock;
      const call = mockLog.calls[0][0];
      expect(call).toContain(duplicatePayload.plugin);
      expect(call).toContain(duplicatePayload.link);
      expect(call).toContain(duplicatePayload.displayName);
    });
  });
});
