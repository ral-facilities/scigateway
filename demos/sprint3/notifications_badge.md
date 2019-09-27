# Notifications Badge

## Stories covered
- #69 add notification badge
- #17 Add a login component

### Context
#### Notifications
1. A user will have specific notifications (registering of plugins for example)
2. These notifications will need to be displayed to the user once they are logged in
3. The user may need to carry out some kind of action on these notifications
#### Websocker server
1. Notifications may be pushed to the plugin, then need to be pushed to the SciGateway for the user to act on
2. These notifications may be derived from somewhere outside of the application e.g. notifications about maintenance work (downtime etc)

## Demo
### Websocket server and notifications badge
1. Start the websocket server
2. Start the SciGateway
3. Send a notification - note that no notification appears when user isn't logged in
4. Login, notifications should appear (count above icon)
5. Continue POST-ing notifications (
```
  {"message": "my test message1", "severity": "success"}
  {"message": "my test message2", "severity": "warning"}
  {"message": "my test message3", "severity": "error"}
```
)
6. Show that notifications can also be removed via the delete icon
7. Architectural diagram documented on the project wiki (https://github.com/ral-facilities/scigateway/wiki/Push-notifications)
