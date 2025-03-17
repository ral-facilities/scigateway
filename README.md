# SciGateway

[![Build Status](https://github.com/ral-facilities/scigateway/workflows/CI%20Build/badge.svg?branch=main)](https://github.com/ral-facilities/scigateway/actions?query=workflow%3A%22CI+Build%22) [![codecov](https://codecov.io/gh/ral-facilities/scigateway/branch/main/graph/badge.svg)](https://codecov.io/gh/ral-facilities/scigateway)

SciGateway is a ReactJs based parent application within a micro-front end architecture. It provides **access to large facilities science**.

The SciGateway application offers features such as authentication and authorisation functionality, notifications, cookies management.

## Code details

This project uses [Vite](https://vitejs.dev/).

#### Available Scripts

In the project directory, you can run:

### `yarn dev`

Runs the `dev` script, which runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn test`

Runs unit tests

### `yarn e2e`

Runs e2e tests

### `yarn lint`

Lints all code under /src

### `yarn build`

Builds the app for production to the `dist` folder.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

See the section about [building for production](https://vitejs.dev/guide/build.html) for more information.

### `yarn preview`

Deploys a static version of the build from the `dist` directory to port 5001. Use `yarn preview:build` to build and preview it in SciGateway.
