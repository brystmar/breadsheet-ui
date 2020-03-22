import React from 'react';
import loading from '../loading.gif'

function LoadingIcon(props) {
    return (
        <img alt="Loading..."
            // src="%PUBLIC_URL%/loading.gif"
            // src="https://breadsheet-public.s3-us-west-2.amazonaws.com/loading.gif"
             src={loading}
             className={props.cssClass}
        />
    )
}

export default LoadingIcon;
