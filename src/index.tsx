import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'custom-event-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'typeface-roboto';

ReactDOM.render(<App />, document.getElementById('root'));
