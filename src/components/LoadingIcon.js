import React from 'react';

function LoadingIcon(props) {
    return (
        <img src="./icons/loading.gif"
             alt="Loading icon"
             className={props.cssClass}/>
    )
}

LoadingIcon.defaultProps = {
    cssClass: ""
}

export default LoadingIcon;
