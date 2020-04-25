import React from 'react';
import BreadsheetLogo from './BreadsheetLogo';

function Footer() {
    return (
        <div className="app-footer">
            {/* TODO: Why are targeted CSS styles for .navbar affecting this component? */}
            Another mediocre app by brystmar
            <a href="http://github.com/brystmar/" target="_blank" rel="noopener noreferrer"><BreadsheetLogo/></a>
        </div>
    )
}

export default Footer;
