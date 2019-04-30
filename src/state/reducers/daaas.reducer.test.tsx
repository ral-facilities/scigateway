import {
  toggleDrawer,
  authorised,
  unauthorised,
  loadingAuthentication,
  dismissMenuItem,
} from '../actions/daaas.actions';
import DaaasReducer, { initialState } from './daaas.reducer';
import { DaaasState } from '../state.types';
import { SignOutType, TokenExpiredType } from '../daaas.types';
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
});
