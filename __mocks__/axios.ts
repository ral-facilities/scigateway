const requests = {
  get: vi.fn((path) => {
    if (path === '/settings.json') {
      return Promise.resolve({
        data: {
          'auth-provider': 'jwt',
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
  post: vi.fn(() => Promise.resolve({ data: {} })),
};

export default requests;
