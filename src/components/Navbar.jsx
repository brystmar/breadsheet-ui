import React from "react";

export default function Navbar() {
    return (
        <nav className="nav-content">
            <ul className="nav-list">
                <li className="nav-item">
                    {/*TODO: App icon top-left, then recipe title */}
                    <a href="/" className="nav-link">Breadsheet</a>
                </li>
            </ul>
        </nav>
    )
}
