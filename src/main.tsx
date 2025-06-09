import { createRoot } from 'react-dom/client';
import 'typeface-roboto';
import App from './App';
import './i18n';

const container = document.getElementById('scigateway');

const root = createRoot(container!);
root.render(<App useSuspense={false} />);
