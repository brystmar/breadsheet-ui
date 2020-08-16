import React from 'react';
import LoadingIcon from './LoadingIcon';

function PageTitle(props) {
    if (props.title === PageTitle.defaultProps.title) {
        // TODO: Remove this once page transitions are smoother
        console.log("Loading Default Title...")
    }
    return (
        <div className={props.includeHr ? "page-title page-title-border" : "page-title"}>
            {props.title ? props.title : <LoadingIcon cssClass="loading-icon-title"/>}
        </div>
    )
}

PageTitle.defaultProps = {
    title: "Breadsheet",
    includeHr: true
}

export default PageTitle;
