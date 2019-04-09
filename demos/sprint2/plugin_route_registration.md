Plugin Route registration
=========================
Stories Covered
~~~~~~~~~~~~~~~
#24 - Allow plugins to register a new route with the parent app
#47 - Use fuzzy ordering for the navigation links
Preconditions
~~~~~~~~~~~~~
A plugin compiled with multiple 'register route' fired off in the index.tsx file. 
The demo-plugin project has two events configured.
It would be worth creating more to show the nav-bar sorting:
- Two sections (displayed ALPHABETICALLY)
- A few routes defined in one of those with priorities to affect the "order by" which is done by displayName and order e.g. "plugin"(0) "another"(10) "final" (10), "last" (99) in that order whatever order the events are fired.
Clicking a link will drop you on <baseUrl>/<link-taken-from-the-register-event>: it's up to the microfrontend to do something useful with that.
