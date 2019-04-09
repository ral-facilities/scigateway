Strings from a file
===================

Stories Covered
~~~~~~~~~~~~~~~

#53 - Load strings for a file

Summary
~~~~~~~

Strings are configured in the public/res/default.json file.  This file location is set in the "ui-strings" attribute of settings.json. There is NO default configured at the moment; it would be straightforward to extend the loader to pick up "res/default.json" if the path specified in settings.json doesn't exist but that is probably a 'later' action (e.g. when looking at language handling).

The first level of the dict keys are "page names"; each UI component call pull a top-level chunk off the state to use.
After that everything is set up to assume a single level of "key: value" at the moment.

If a key can't be found in the dict the key is returned (so in Storybook you now see key-names rather than values).
I've updated mainAppBar and the login screen to get their strings from the file at the moment.

An event is fired after the settings.json file is loaded which can be seen in the redux tools.