import React from 'react';

function LoadingIcon(props) {
    return (
        <img alt="Loading..."
            // src="%PUBLIC_URL%/loading.gif"
            // src="https://breadsheet-public.s3-us-west-2.amazonaws.com/loading.gif"
             src="./loading.gif"
             className={props.cssClass}
        />
    )
}

export default LoadingIcon;
