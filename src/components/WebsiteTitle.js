import React from 'react';
import logo from '../bread-loaf-long.png';
import {Link} from 'react-router-dom';

function WebsiteTitle() {
    return (
        <div className="website-title">
            <Link to="/">Breadsheet</Link>
            <img src={logo} className="bread-clipart-image" alt="logo"/>
        </div>
    )
}

export default WebsiteTitle;
