import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {BrowserRouter as Router} from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './styles/app.css';
import './styles/recipe_list.css';
import './styles/recipe_attributes.css';
import './styles/steps.css';
import './styles/add_recipe_or_step.css';
import './styles/footer.css';


ReactDOM.render(
    <Router>
        <App/>
    </Router>, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
