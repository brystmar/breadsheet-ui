import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {BrowserRouter as Router} from 'react-router-dom';

// ReactDOM.render(<App />, document.getElementById('root'));

ReactDOM.render(
    <Router>
        <App />
    </Router>, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

// Make the NavBar sticky
// When the user scrolls the page, execute myFunction
window.onscroll = function() {makeNavBarSticky()};

// Get the navbar & offset position of the navbar
let navbar = document.getElementById("header")
let sticky = navbar.offsetTop;

// Add the sticky class to the navbar when you reach its scroll position
// Remove "sticky" when you leave the scroll position
function makeNavBarSticky() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
}
