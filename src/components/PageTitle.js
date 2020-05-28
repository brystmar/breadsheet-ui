import React from 'react';
import LoadingIcon from './LoadingIcon';

function PageTitle(props) {
    return (
        <div className="page-title">
            {props.title ? props.title : <LoadingIcon cssClass="loading-icon-title"/>}
            {props.includeHr ? <hr/> : ""}
        </div>
    )
}

PageTitle.defaultProps = {
    title: "Default Title"
}

export default PageTitle;
