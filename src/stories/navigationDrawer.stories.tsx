import React from 'react';
import { storiesOf } from '@storybook/react';
import { NavigationDrawerWithStyles } from '../navigationDrawer/navigationDrawer.component';

const placeHolderStyle = {
  height: 250,
  padding: 50,
  margin: 3,
  border: '2px dashed black',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

storiesOf('NavigationDrawer', module).add('default', () => (
  <div>
    <NavigationDrawerWithStyles
      open={true}
      plugins={[
        {
          order: 1,
          displayName: 'Plugin1 Route',
          section: 'Data',
          link: '/plugin1/page',
          plugin: 'plugin1',
        },
        {
          order: 2,
          displayName: 'Plugin2 Route',
          section: 'Data',
          link: '/plugin2/page',
          plugin: 'plugin2',
        },
        {
          order: 3,
          displayName: 'Plugin2 Analysis',
          section: 'Analysis',
          link: '/plugin2/analyse',
          plugin: 'plugin2',
        },
      ]}
      darkMode={false}
      res={undefined}
    />
    <div
      style={{
        width: 'calc(100% - 400px)',
        ...placeHolderStyle,
        marginLeft: 300,
      }}
    >
      Main App Area
    </div>
  </div>
));
