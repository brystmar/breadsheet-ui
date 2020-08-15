import React from 'react';
import LoadingIcon from './LoadingIcon';

function PageTitle(props) {
    if (props.title === PageTitle.defaultProps.title) {
        console.log("Loading Default Title...")
    }
    return (
        <div className="page-title">
            {props.title ? props.title : <LoadingIcon cssClass="loading-icon-title"/>}
        </div>
    )
}

PageTitle.defaultProps = {
    title: "Breadsheet",
    includeHr: true
}

export default PageTitle;
