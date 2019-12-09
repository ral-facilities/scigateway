## Updating the plugin used for end-to-end (e2e) tests

The files in the `e2e-plugin` folder are simply the build artifacts from the demo plugin (https://github.com/ral-facilities/scigateway-demo-plugin).

To update the plugin:
- Checkout the demo plugin, 
- build the plugin (with `npm run build`) 
- and copy the contents of the `build` into the `e2e-plugin` folder.