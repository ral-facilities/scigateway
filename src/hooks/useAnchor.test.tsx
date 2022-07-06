/**
 * A mock location that useLocation will return
 */
import type { MockStoreCreator } from 'redux-mock-store';
import configureStore from 'redux-mock-store';
import type { DeepPartial } from 'redux';
import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { StateType } from '../state/state.types';
import useAnchor from './useAnchor';
import { Provider } from 'react-redux';
import { useLocation } from 'react-router';
import { createLocation } from 'history';

function TestComponent(): JSX.Element {
  useAnchor();
  return <></>;
}

const MOCK_REACT_ROUTER_LOCATION: Partial<Location> = {
  hash: '#fragment',
};

// mock implementation of useLocation to return the mock URL
jest.mock('react-router', () => ({
  __esModule: true,
  ...jest.requireActual('react-router'),
  useLocation: jest.fn(),
}));

describe('useAnchor', () => {
  let mount: ReturnType<typeof createMount>;
  let createMockStore: MockStoreCreator<DeepPartial<StateType>>;

  beforeEach(() => {
    // use fake timers bc useAnchor uses setTimeout under the hood
    jest.useFakeTimers();
    // for some reason scrollIntoView is undefined in JSDOM
    // we need to create a stub for it
    Element.prototype.scrollIntoView = jest.fn();
    (useLocation as jest.Mock).mockReturnValue(MOCK_REACT_ROUTER_LOCATION);
    mount = createMount();
    createMockStore = configureStore();
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should scroll the element into view if the fragment in URL matches an element', () => {
    const mockStore = createMockStore({
      scigateway: {
        siteLoading: false,
      },
      router: { location: createLocation('/') },
    });
    mount(
      <Provider store={mockStore}>
        <TestComponent />
        <div id="fragment" />
      </Provider>
    );
    const element = document.getElementById('fragment');
    if (!element) {
      throw new Error('Unexpected condition occurred.');
    }

    jest.runAllTimers();

    const spy = jest.spyOn(element, 'scrollIntoView');
    // fragment matches an element, should be scrolled into view
    expect(spy).toBeCalledTimes(1);
  });

  it('should do nothing if the fragment in URL does not match any element', () => {
    const mockStore = createMockStore({
      scigateway: {
        siteLoading: false,
      },
      router: { location: createLocation('/') },
    });
    mount(
      <Provider store={mockStore}>
        <TestComponent />
        <div id="abc" />
      </Provider>
    );
    const element = document.getElementById('abc');
    if (!element) {
      throw new Error('Unexpected condition occurred.');
    }

    jest.runAllTimers();

    const spy = jest.spyOn(element, 'scrollIntoView');
    // fragment is #fragment but div id is abc
    // should NOT be scrolled into view
    expect(spy).not.toBeCalled();
  });

  it('should do nothing even when fragment matches an element when website is loading', function () {
    const mockStore = createMockStore({
      scigateway: {
        siteLoading: true,
      },
      router: { location: createLocation('/') },
    });
    mount(
      <Provider store={mockStore}>
        <TestComponent />
        <div id="fragment" />
      </Provider>
    );
    const element = document.getElementById('fragment');
    if (!element) {
      throw new Error('Unexpected condition occurred.');
    }

    jest.runAllTimers();

    const spy = jest.spyOn(element, 'scrollIntoView');
    // fragment matches an element but website still loading
    expect(spy).not.toBeCalled();
  });
});
