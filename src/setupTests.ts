import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// React 16 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() });

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

export const flushPromises = (): Promise<void> => new Promise(setImmediate);
