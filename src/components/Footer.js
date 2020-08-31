import React from 'react';
import BreadsheetLogo from './BreadsheetLogo';

function Footer() {
    return (
        <footer className="footer-container">
            Another mediocre app by
            <a href="https://github.com/brystmar/"
               className="footer-link"
               target="_blank "
               rel="noopener noreferrer">
                brystmar</a>
            <a href="https://github.com/brystmar/breadsheet-ui/"
               className="footer-link"
               target="_blank"
               rel="noopener noreferrer">
                <BreadsheetLogo/>
            </a>
        </footer>
    )
}

export default Footer;
