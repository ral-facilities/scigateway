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

        server.ws.send({
          type: 'full-reload',
          path: '*',
        });
      }
    },
  };
}

// Obtain default coverage config from vitest when not building for production
// (to avoid importing vitest during build as its a dev dependency)
let vitestCoverageConfigDefaultsExclude: string[] = [];
if (process.env.NODE_ENV !== 'production') {
  await import('vitest/config').then((vitestConfig) => {
    vitestCoverageConfigDefaultsExclude =
      vitestConfig.coverageConfigDefaults.exclude;
  });
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
          ...vitestCoverageConfigDefaultsExclude,
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
