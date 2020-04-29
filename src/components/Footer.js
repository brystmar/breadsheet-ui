import React from 'react';
import BreadsheetLogo from './BreadsheetLogo';

function Footer() {
    return (
        <footer className="app-footer">
            {/* TODO: Why are targeted CSS styles for .navbar affecting this component? */}
            Another mediocre app by brystmar
            <a href="http://github.com/brystmar/" target="_blank" rel="noopener noreferrer"><BreadsheetLogo/></a>
        </footer>
    )
}

export default Footer;
