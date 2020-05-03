import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import BackendUrlContext from './context/BackendUrlContext';
import { BrowserRouter as Router } from 'react-router-dom';


ReactDOM.render(
    <Router>
        {/*Dev:*/}
        <BackendUrlContext.Provider value="http://localhost:5000">
        {/*Prod:*/}
        {/*<BackendUrlContext.Provider value="http://breadsheet.wl.r.appspot.com">*/}
            <App/>
        </BackendUrlContext.Provider>
    </Router>, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
