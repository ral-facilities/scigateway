import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'custom-event-polyfill';
import './i18n';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'typeface-roboto';

const container = document.getElementById('scigateway');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(<App useSuspense={false} />);
