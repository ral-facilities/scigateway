import '@testing-library/jest-dom';

function noOp(): void {
  // required as work-around for enzyme/jest environment not implementing window.URL.createObjectURL method
}

if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: noOp });
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

export const flushPromises = (): Promise<void> =>
  new Promise(jest.requireActual('timers').setImmediate);

// globally mock as we never want to actually call single-spa funcs in unit tests
vi.mock('single-spa', () => ({
  unloadApplication: vi.fn(),
  start: vi.fn(),
  getAppStatus: vi.fn(),
  triggerAppChange: vi.fn(),
  NOT_LOADED: 'NOT_LOADED',
}));
