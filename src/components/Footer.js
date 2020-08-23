import React from 'react';
import BreadsheetLogo from './BreadsheetLogo';

function Footer() {
    return (
        <footer className="footer-container">
            Another mediocre app by brystmar
            <a href="http://github.com/brystmar/breadsheet-ui/"
               target="_blank"
               rel="noopener noreferrer">
                <BreadsheetLogo />
            </a>
        </footer>
    )
}

export default Footer;
