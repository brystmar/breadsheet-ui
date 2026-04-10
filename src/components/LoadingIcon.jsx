import React from "react";

export default function LoadingIcon({ cssClass = "" }) {
    return (
        <img
            src="./icons/loading.gif"
            alt="Loading icon"
            className={cssClass}
        />
    )
}
