import React from 'react';
import logo from '../bread-loaf-long.png';
import {Link} from 'react-router-dom';

function Header() {
    return (
        <header className="app-header">
            <table valign="center">
                <thead>
                <tr>
                    <td className="header-hamburger" width="40px;" align="left">
                        <img src={logo} className="header-hamburger-logo" alt="logo"/>
                    </td>
                    <td className="header-title">
                        <Link to="/">Breadsheet</Link>
                    </td>
                    <td className="header-hamburger-reverse" width="40px;" align="left">
                        <img src={logo} className="header-hamburger-logo" alt="logo"/>
                    </td>
                </tr>
                </thead>
            </table>
        </header>
    )
}

export default Header;
