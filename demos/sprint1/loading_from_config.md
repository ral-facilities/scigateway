# Loading site configuration from file

## Stories covered
- #19 Load site configuration file

## Demo
- Settings should be read from a config file, allowing e.g.
  - Menu options specific to deployment
  - Other deployment specific settings

- Site configuration should be automatically updated, i.e.
  - if the config file is updated, the webpage should automatically update to reflect this 


- Given a running instance of the app
- Then modifications to `public/settings.json` are reflected in that instance