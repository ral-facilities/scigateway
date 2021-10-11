import React from 'react';
import { storiesOf } from '@storybook/react';
import { NotificationBadgeWithStyles } from '../notifications/notificationBadge.component';
import { ScigatewayNotification } from '../state/state.types';
import { FakeReduxAction } from './utils';
import { storybookResourceStrings } from './storybookResourceStrings';

const buildNotificationBadge = (
  notifications: ScigatewayNotification[]
): React.ReactElement => (
  <div style={{ background: '#1D4F91' }}>
    <NotificationBadgeWithStyles
      notifications={notifications}
      res={storybookResourceStrings['main-appbar']}
      deleteMenuItem={FakeReduxAction('delete menu item')}
    />
  </div>
);

storiesOf('NotificationBadge', module)
  .addParameters({
    info: {
      text: 'This badge displays notifications for the logged in user.',
    },
  })

  .add('default', () => buildNotificationBadge([]))
  .add('hasNotifications', () => {
    return buildNotificationBadge([
      { message: 'a warning message', severity: 'warning' },
      { message: 'an error message', severity: 'error' },
    ]);
  });
