import { defineConfig } from 'cypress';

export default defineConfig({
  chromeWebSecurity: false,
  video: false,
  retries: {
    runMode: 0,
    openMode: 0,
  },
  e2e: {
    baseUrl: 'http://127.0.0.1:3000',
  },
});
