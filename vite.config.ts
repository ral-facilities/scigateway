import react from '@vitejs/plugin-react';
import { PluginOption, defineConfig, loadEnv } from 'vite';

/* See https://stackoverflow.com/questions/69626090/how-to-watch-public-directory-in-vite-project-for-hot-reload allows
   hot reloading when json files are modifeid in the public folder*/
function jsonHMR(): PluginOption {
  return {
    name: 'json-hmr',
    enforce: 'post',
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.json')) {
        console.log('reloading json file...');

        server.hot.send({
          type: 'full-reload',
          path: '*',
        });
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const plugins: PluginOption[] = [react()];

  // Allow hot reloading of json files in public folder when in development
  if (env.NODE_ENV === 'development') plugins.push(jsonHMR());

  return {
    plugins: plugins,
    server: {
      port: 3000,
      // Don't open by default as Dockerfile wont run as it can't find a display
      open: false,
    },
    preview: {
      port: 5001,
    },
    define: {
      // See https://vitejs.dev/guide/build.html#library-mode
      // we need to replace here as the build in library mode won't
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
    },
    test: {
      globals: 'true',
      environment: 'jsdom',
      globalSetup: './globalSetup.js',
      setupFiles: ['src/setupTests.tsx'],
      coverage: {
        exclude: [
          'public/*',
          'server/*',
          // Leave handlers to show up unused code
          'src/mocks/browser.ts',
          'src/mocks/server.ts',
          'src/vite-env.d.ts',
          'src/main.tsx',
          'src/testUtils.tsx',
        ],
      },
    },
  };
});
