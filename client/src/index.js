import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Routes from './Routes'
import * as serviceWorker from './serviceWorker';
import CssBaseline from '@material-ui/core/CssBaseline';

ReactDOM.render(
    <React.StrictMode>
        <CssBaseline/>
        <Routes/>
    </React.StrictMode>,
    document.getElementById('root')
);

serviceWorker.unregister();
