import React from 'react';
import EditButton from "./EditButton";

function RecipeListHeader(props) {
    return (
        <div className="list-header recipe-list-item">
            <span>Recipe Name</span>
            <span>Difficulty</span>
            <span>Length</span>
            <span>Author</span>
            <span>Source</span>
            <div className="icon-cell">
                <EditButton onClickFn={props.onClickFn} onClickParam={props.onClickParam}/>
            </div>
        </div>
    )
}

RecipeListHeader.defaultProps = {
    onClickParam: true
}

export default RecipeListHeader;
