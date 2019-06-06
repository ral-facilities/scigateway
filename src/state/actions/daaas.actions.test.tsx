import mockAxios from 'axios';
import { Action } from 'redux';
import {
  toggleDrawer,
  verifyUsernameAndPassword,
  loadingAuthentication,
  authorised,
  loadFeatureSwitches,
  configureSite,
  dismissMenuItem,
  siteLoadingUpdate,
  loadStrings,
  unauthorised,
} from './daaas.actions';
import {
  ToggleDrawerType,
  ConfigureFeatureSwitchesType,
  DismissNotificationType,
} from '../daaas.types';
import { initialState } from '../reducers/daaas.reducer';
import TestAuthProvider from '../../authentication/testAuthProvider';
import { StateType } from '../state.types';
import loadMicroFrontends from './loadMicroFrontends';
import log from 'loglevel';

jest.useFakeTimers();

function mockAxiosGetResponse(message: string): void {
  (mockAxios.get as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({
      data: {
        title: message,
      },
    })
  );
}

describe('daaas actions', () => {
  beforeEach(() => {
    (mockAxios.get as jest.Mock).mockReset();

    (mockAxios.post as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          token: 'token123',
        },
      })
    );

    loadMicroFrontends.init = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
  });

  it('toggleDrawer only needs a type', () => {
    const action = toggleDrawer();
    expect(action.type).toEqual(ToggleDrawerType);
  });

  it('given valid credentials verifyUsernameAndPassword should return with a valid token and successful authorisation', async () => {
    mockAxiosGetResponse(
      'this will be replaced by an API call to get access token'
    );

    const asyncAction = verifyUsernameAndPassword('username', 'password');
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const state = JSON.parse(JSON.stringify(initialState));
    state.authorisation.provider = new TestAuthProvider(null);

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const getState = (): any => ({
      daaas: state,
      router: {
        location: {
          state: {
            referrer: '/destination/after/login',
          },
        },
      },
    });

    const action = asyncAction(dispatch, getState);
    jest.runAllTimers();
    await action;

    expect(actions[0]).toEqual(loadingAuthentication());
    expect(actions[1]).toEqual(authorised('validLoginToken'));
    expect(actions[2]).toEqual({
      type: '@@router/CALL_HISTORY_METHOD',
      payload: {
        args: ['/destination/after/login'],
        method: 'push',
      },
    });
  });

  it('given no referrer but valid credentials verifyUsernameAndPassword should redirect back to /', async () => {
    mockAxiosGetResponse(
      'this will be replaced by an API call to get access token'
    );

    const asyncAction = verifyUsernameAndPassword('username', 'password');
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const state = JSON.parse(JSON.stringify(initialState));
    state.authorisation.provider = new TestAuthProvider(null);

    // const getState = (): Partial<StateType> => ({ daaas: state });
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const getState = (): any => ({
      daaas: state,
      router: {
        location: {
          state: {},
        },
      },
    });

    const action = asyncAction(dispatch, getState);
    jest.runAllTimers();
    await action;

    expect(actions[0]).toEqual(loadingAuthentication());
    expect(actions[1]).toEqual(authorised('validLoginToken'));
    expect(actions[2]).toEqual({
      type: '@@router/CALL_HISTORY_METHOD',
      payload: {
        args: ['/'],
        method: 'push',
      },
    });
  });

  it('given invalid credentials verifyUsernameAndPassword should return an authorisation failure', async () => {
    mockAxiosGetResponse(
      'this will be replaced by an API call to get access token'
    );

    const asyncAction = verifyUsernameAndPassword('INVALID_NAME', 'password');
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);

    const state = JSON.parse(JSON.stringify(initialState));
    state.authorisation.provider = new TestAuthProvider(null);
    const getState = (): Partial<StateType> => ({ daaas: state });

    const action = asyncAction(dispatch, getState);
    jest.runAllTimers();
    await action;
    const expectedResponse = { type: 'daaas:auth_failure' };

    expect(actions[0]).toEqual(loadingAuthentication());
    expect(actions[1]).toEqual(expectedResponse);
  });

  it('given feature settings loadFeatureSwitches updates state to show feature', () => {
    const features = { showContactButton: true };

    const action = loadFeatureSwitches(features);
    expect(action.type).toEqual(ConfigureFeatureSwitchesType);
    expect(action.payload.switches).toEqual({ showContactButton: true });
  });

  it('given a feature switch loadFeatureSwitches is run', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          features: { showContactButton: true },
          'ui-strings': '/res/default.json',
        },
      })
    );

    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const getState = (): Partial<StateType> => ({ daaas: initialState });

    await asyncAction(dispatch, getState);

    expect(actions[1]).toEqual(
      loadFeatureSwitches({ showContactButton: true })
    );
  });

  it('dispatches a site loading update after settings are loaded', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          features: { showContactButton: true },
          'ui-strings': '/res/default.json',
        },
      })
    );

    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): void | Promise<void> => {
      if (typeof action === 'function') {
        action(dispatch);
        return Promise.resolve();
      } else {
        actions.push(action);
      }
    };

    const state = JSON.parse(JSON.stringify(initialState));
    let testAuthProvider = new TestAuthProvider('token');
    testAuthProvider.verifyLogIn = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve());
    state.authorisation.provider = testAuthProvider;
    const getState = (): Partial<StateType> => ({ daaas: state });

    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(5);
    expect(actions).toContainEqual(authorised());
    expect(actions).toContainEqual(siteLoadingUpdate(false));
  });

  it('dispatches a site loading update after settings are loaded with failed auth, no features and no leading slash on ui-strings', async () => {
    (mockAxios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          'ui-strings': 'res/default.json',
        },
      })
    );

    const asyncAction = configureSite();
    const actions: Action[] = [];
    const dispatch = (action: Action): void | Promise<void> => {
      if (typeof action === 'function') {
        action(dispatch);
        return Promise.resolve();
      } else {
        actions.push(action);
      }
    };

    const state = JSON.parse(JSON.stringify(initialState));
    state.authorisation.provider = new TestAuthProvider('token');
    const getState = (): Partial<StateType> => ({ daaas: state });

    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(4);
    expect(actions).toContainEqual(unauthorised());
    expect(actions).toContainEqual(siteLoadingUpdate(false));
  });

  it('given an index number dismissMenuItem returns a DismissNotificationType with payload', () => {
    const action = dismissMenuItem(0);
    expect(action.type).toEqual(DismissNotificationType);
    expect(action.payload).toEqual({ index: 0 });
  });

  it('logs an error if loadStrings fails to resolve', async () => {
    (mockAxios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({})
    );
    log.error = jest.fn();

    const path = 'non/existent/path';
    const asyncAction = loadStrings(path);
    const actions: Action[] = [];
    const dispatch = (action: Action): number => actions.push(action);
    const getState = (): Partial<StateType> => ({ daaas: initialState });

    await asyncAction(dispatch, getState);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      expect.stringContaining(`Failed to read strings from ${path}: `)
    );
  });
});
