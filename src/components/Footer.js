import React from 'react';
import BreadsheetLogo from './BreadsheetLogo';

export default function Footer() {
    return (
        <footer className="footer-container">
            An unsurprisingly-food-related webapp by
            <a
                href="https://github.com/brystmar/"
                className="footer-link"
                target="_blank"
                rel="noopener noreferrer"
            >
                brystmar
            </a>
            <a
                href="https://github.com/brystmar/breadsheet-ui/"
                className="footer-link"
                target="_blank"
                rel="noopener noreferrer"
            >
                <BreadsheetLogo />
            </a>
        </footer>
    )
}
