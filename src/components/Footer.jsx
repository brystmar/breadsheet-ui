import React from "react";
import { Link } from "react-router";
import BreadsheetLogo from "./BreadsheetLogo";
import FooterFeatureLevel from "./FooterFeatureLevel";

// One quiet line: the name (and its spinning baguette) on the left; links and the feature-level toggle on
// the right. The toggle is temporary, so nothing else depends on its position.
export default function Footer() {
    return (
        <footer className="footer-container">
            <Link to="/" className="footer-brand">
                Breadsheet
                <BreadsheetLogo />
            </Link>

            <div className="footer-links">
                <Link to="/privacy" className="footer-link">Privacy</Link>
                <span className="footer-separator" aria-hidden="true">·</span>
                <a href="https://github.com/brystmar"
                   className="footer-link"
                   target="_blank"
                   rel="noopener noreferrer">GitHub</a>
            </div>

            <FooterFeatureLevel />
        </footer>
    )
}
