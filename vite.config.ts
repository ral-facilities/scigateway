import react from '@vitejs/plugin-react';
import browserslistToEsbuild from 'browserslist-to-esbuild';
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
export default defineConfig(({ mode }) => {
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
    build: {
      // Use browserslist config
      target: browserslistToEsbuild(),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/setupTests.ts'],
      coverage: {
        reporter: [
          // Default
          'text',
          'html',
          'clover',
          'json',
          // Extra for VSCode extension
          ['lcov', { outputFile: 'lcov.info', silent: true }],
        ],
        exclude: [
          'public/*',
          'server/*',
          '__mocks__/axios.ts',
          'micro-frontend-tools/serve-plugins.js',
          '.eslintrc.cjs',
          'src/vite-env.d.ts',
          'src/main.tsx',
        ],
      },
    },
  };
});
