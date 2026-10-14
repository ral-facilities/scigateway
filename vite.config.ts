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

        server.ws.send({
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
    },
    preview: {
      port: 5001,
    },
    build: {
      // Use browserslist config
      target: 'baseline-widely-available',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/setupTests.ts'],
      dir: 'src',
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
        exclude: ['src/vite-env.d.ts', 'src/main.tsx'],
      },
    },
  };
});
