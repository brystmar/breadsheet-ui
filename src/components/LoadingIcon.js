import React from "react";

export default function LoadingIcon(props) {
    return (
        <img
            src="./icons/loading.gif"
            alt="Loading icon"
            className={props.cssClass}
        />
    )
}

LoadingIcon.defaultProps = {
    cssClass: ""
}
