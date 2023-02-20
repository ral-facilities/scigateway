import type { MockStoreCreator } from 'redux-mock-store';
import configureStore from 'redux-mock-store';
import type { DeepPartial } from 'redux';
import * as React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { useLocation } from 'react-router';
import { createLocation } from 'history';
import useAnchor from './useAnchor';
import { StateType } from '../state/state.types';

/**
 * A simple React component that uses useAnchor for testing purposes.
 */
function TestComponent(): JSX.Element {
  useAnchor();
  return <></>;
}

/**
 * A mock value for what useLocation from react-router would return
 */
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
  let createMockStore: MockStoreCreator<DeepPartial<StateType>>;

  beforeEach(() => {
    // use fake timers bc useAnchor uses setTimeout under the hood
    jest.useFakeTimers();
    (useLocation as jest.Mock).mockReturnValue(MOCK_REACT_ROUTER_LOCATION);
    createMockStore = configureStore();
  });

  afterEach(() => {
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

    const mockScrollIntoView = jest.fn();
    // pretend an element is found that matches the fragment
    // the weird type cast is to get around TypeScript error saying
    // the object is missing a bunch of other properties
    // we obviously don't care about them so there's no point in stubbing them.
    jest.spyOn(document, 'getElementById').mockReturnValueOnce({
      scrollIntoView: mockScrollIntoView,
    } as unknown as HTMLDivElement);

    mount(
      <Provider store={mockStore}>
        <TestComponent />
      </Provider>
    );

    jest.runAllTimers();

    // fragment matches an element, should be scrolled into view
    expect(mockScrollIntoView).toBeCalledTimes(1);
  });

  it('should do nothing if the fragment in URL does not match any element', () => {
    const mockStore = createMockStore({
      scigateway: {
        siteLoading: false,
      },
      router: { location: createLocation('/') },
    });

    const mockScrollIntoView = jest.fn();
    // pretend no element with #fragment is found
    // and pretend there is other elements with IDs != fragment
    jest.spyOn(document, 'getElementById').mockImplementation((id) =>
      id === 'fragment'
        ? null
        : ({
            scrollIntoView: mockScrollIntoView,
          } as unknown as HTMLDivElement)
    );
    // another element with ID "other", which is obv != fragment
    const otherElem = document.getElementById('other');

    mount(
      <Provider store={mockStore}>
        <TestComponent />
      </Provider>
    );

    jest.runAllTimers();

    // fragment doesn't match any element, useAnchor should not randomly
    // jump to other elements
    expect(otherElem.scrollIntoView).not.toBeCalled();
  });

  it('should do nothing even when fragment matches an element when website is loading', function () {
    const mockStore = createMockStore({
      scigateway: {
        siteLoading: true,
      },
      router: { location: createLocation('/') },
    });

    const mockScrollIntoView = jest.fn();
    // pretend an element is found that matches the fragment
    // the weird type cast is to get around TypeScript error saying
    // the object is missing a bunch of other properties
    // we obviously don't care about them so there's no point in stubbing them.
    jest.spyOn(document, 'getElementById').mockReturnValueOnce({
      scrollIntoView: mockScrollIntoView,
    } as unknown as HTMLDivElement);

    mount(
      <Provider store={mockStore}>
        <TestComponent />
      </Provider>
    );

    jest.runAllTimers();

    // fragment matches an element but website still loading
    expect(mockScrollIntoView).not.toBeCalled();
  });
});
