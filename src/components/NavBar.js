import React from 'react';
import {Link} from 'react-router-dom';

function NavBar() {
    return (
        <nav className="nav-bar">
            <Link to="/" className="nav-list">Home</Link>
            <Link to="/convert" className="nav-list">Convert Text</Link>
        </nav>
    )
}

export default NavBar;
