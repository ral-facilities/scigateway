import React from 'react';
import Preloader from '../preloader/preloader.component';
import { storiesOf } from '@storybook/react';
import { ReduxDecorator } from './utils';
import '../index.css';

storiesOf('Preloader', module)
  .addDecorator(ReduxDecorator((s) => s))
  .add('renders correctly', () => <Preloader fullScreen={true} />);
