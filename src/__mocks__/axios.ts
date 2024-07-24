// TODO: move __mocks__ folder back to root once facebook/create-react-app#7539 is fixed

const requests = {
  get: jest.fn((path) => {
    if (path === '/settings.json') {
      return Promise.resolve({
        data: {
          // Set provider to icat as that supports maintenance states needed for App.test.tsx
          'auth-provider': expect.getState().testPath?.includes('App.test')
            ? 'icat'
            : 'jwt',
          'ui-strings': '/res/default.json',
          plugins: [],
          'help-tour-steps': [],
        },
      });
    } else {
      return Promise.resolve({
        data: {},
      });
    }
  }),
  post: jest.fn(() => Promise.resolve({ data: {} })),
};

export default requests;
