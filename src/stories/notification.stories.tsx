import React from 'react';
import { storiesOf } from '@storybook/react';
import { NotificationWithStyles } from '../notifications/scigatewayNotification.component';
import { FakeReduxAction } from './utils';

const buildNotification = (
  severity: string,
  message: string
): React.ReactElement => (
  <NotificationWithStyles
    message={message}
    severity={severity}
    index={1}
    dismissNotification={FakeReduxAction('dismiss notification')}
  />
);

storiesOf('Notification', module)
  .addParameters({
    info: {
      text:
        'The menu item displays a notification: an icon, some text and a close button.',
    },
  })

  .add('default', () => buildNotification('success', 'this is a notification'))
  .add('warningNotification', () =>
    buildNotification('this is a notification', 'warning')
  )
  .add('errorNotification', () =>
    buildNotification('this is a notification', 'error')
  );
