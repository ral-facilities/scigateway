import {
  daaasNotification,
  toggleDrawer,
  authorised,
  unauthorised,
  signOut,
  loadingAuthentication,
} from '../actions/daaas.actions';
import DaaasReducer, { initialState } from './daaas.reducer';
import { DaaasState } from '../state.types';

describe('daaas reducer', () => {
  let state: DaaasState;

  beforeEach(() => {
    state = initialState;
  });

  it('should update notifications with notification message', () => {
    const action = daaasNotification('test message');

    const updatedState = DaaasReducer(state, action);

    expect(updatedState.notifications).toHaveLength(1);
    expect(updatedState.notifications[0]).toEqual('test message');
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

  it('successful log in should update authorisation to logged in state', () => {
    const action = authorised('token');
    let updatedState = DaaasReducer(state, action);
    const authorisedState = {
      token: 'token',
      failedToLogin: false,
      loggedIn: true,
      loading: false,
    };

    expect(updatedState.authorisation).toEqual(authorisedState);
  });

  it('unsuccessful log in should update authorisation to not logged in state', () => {
    const action = unauthorised();
    let updatedState = DaaasReducer(state, action);
    const unAuthorisedState = {
      token: '',
      failedToLogin: true,
      loggedIn: false,
      loading: false,
    };

    expect(updatedState.authorisation).toEqual(unAuthorisedState);
  });

  it('should sign user out for a signOut message', () => {
    const action = signOut();
    const signInState = {
      token: 'token',
      failedToLogin: false,
      loggedIn: true,
    };

    let updatedState = DaaasReducer(signInState, action);
    const signOutState = {
      token: '',
      failedToLogin: false,
      loggedIn: false,
    };

    expect(updatedState.authorisation).toEqual(signOutState);
  });
});
