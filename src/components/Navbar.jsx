import React from "react";
import NavAccount from "./identity/NavAccount";
import { AtFeatureLevel } from "../hooks/useFeatureLevel";

export default function Navbar() {
    return (
        <nav className="nav-content">
            <ul className="nav-list">
                <li className="nav-item">
                    {/*TODO: App icon top-left, then recipe title */}
                    <a href="/" className="nav-link">Breadsheet</a>
                </li>
            </ul>

            {/* Sign up, sign in, and the signed-in user (M2) */}
            <AtFeatureLevel min="m2">
                <NavAccount />
            </AtFeatureLevel>
        </nav>
    )
}
