export default {
  get: jest.fn(path => {
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
  post: jest.fn(() => Promise.resolve({ data: {} })),
};
