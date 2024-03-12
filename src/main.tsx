import 'custom-event-polyfill';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import { createRoot } from 'react-dom/client';
import 'typeface-roboto';
import App from './App';
import './i18n';

const container = document.getElementById('scigateway');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(<App useSuspense={false} />);
