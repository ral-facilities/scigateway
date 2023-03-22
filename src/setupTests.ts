import '@testing-library/jest-dom';

function noOp(): void {
  // required as work-around for enzyme/jest environment not implementing window.URL.createObjectURL method
}

if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: noOp });
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

export const flushPromises = (): Promise<void> => new Promise(process.nextTick);

// globally mock as we never want to actually call single-spa funcs in unit tests
jest.mock('single-spa', () => ({
  unloadApplication: jest.fn(),
  start: jest.fn(),
  getAppStatus: jest.fn(),
  triggerAppChange: jest.fn(),
  NOT_LOADED: 'NOT_LOADED',
}));
