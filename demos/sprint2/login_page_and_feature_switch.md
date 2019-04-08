# Login page and feature switch

## Stories covered
- #19 Load site configuration file
- #17 Add a login component

## Demo
### Config file settings
- Extension of issue #19: loading config files from file. These values are read dynamically

- The "contact" button in the menubar can be turned on and off by toggling the value in the settings file "showContactButton"
- This is an example "feature switch"

### Log in component
- The log in component is present in the storybook (run `npm storybook`)
  - title/username/password are loaded from a config file
- The login component is rendered on the homepage and re-directs to the correct page once logged in
- A 404 error page has been added in case a non-existent route is entered
- Entering username `INVALID_NAME` and password results in a warning message about credentials
- Known bugs:
  - button can be clicked without required username and password
  - Routing (this will be placed on a "/login" route)



