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
// Trigger the sticky function when the user scrolls
window.onscroll = () => makeNavBarSticky();

// Get the navbar & offset position of the navbar
let navbar = document.getElementById("navbar")
let sticky = navbar.offsetTop;

// Apply .sticky class to the navbar when its scroll position is reached
// Remove when leaving the scroll position
function makeNavBarSticky() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
}
