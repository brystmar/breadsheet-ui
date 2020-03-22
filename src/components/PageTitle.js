import React from 'react';
import LoadingIcon from "./LoadingIcon";

function PageTitle(props) {
    return (
        <div className="page-title">
            {props.title ?
                props.title :
                <LoadingIcon cssClass="loading-icon-title" />
            }
        </div>
    )
}

export default PageTitle;
