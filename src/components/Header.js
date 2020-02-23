import React from 'react';
import logo from "../logo.svg";

function Header() {
    return (
        <header className="App-header">
            <table valign="center">
                <thead>
                <tr>
                    <td className="header-hamburger" width="40px;" align="left">
                        <img src={logo} className="header-hamburger-logo" alt="logo"/>
                    </td>
                    <td className="header-title">
                        Breadsheet
                    </td>
                </tr>
                </thead>
            </table>
        </header>
    )
}

export default Header;
