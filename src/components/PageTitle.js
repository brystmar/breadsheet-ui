import React from 'react';
import LoadingIcon from './LoadingIcon';

function PageTitle(props) {
    // TODO: Remove this once page transitions are smoother
    // if (props.title === PageTitle.defaultProps.title) {
    //     console.log("Loading Default Title...")
    // }
    return (
        <h1 className={props.includeHr ? "page-title page-title-border" : "page-title"}>
            {props.title ? props.title : <LoadingIcon cssClass="loading-icon-title"/>}
        </h1>
    )
}

PageTitle.defaultProps = {
    title: "Recipes",
    includeHr: true
}

export default PageTitle;
