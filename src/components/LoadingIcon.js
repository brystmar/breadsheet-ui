import React from 'react';
import Spinner from 'react-bootstrap/Spinner';

function LoadingIcon(props) {
    return (
        <Spinner animation="border"
                 variant="secondary"
                 role="status"
                 className={props.cssClass}>
            <span className="sr-only">Loading...</span>
        </Spinner>
    )
}

export default LoadingIcon;
