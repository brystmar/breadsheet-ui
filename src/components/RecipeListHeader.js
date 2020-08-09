import React from 'react';
import EditButton from "./EditButton";

function RecipeListHeader(props) {
    return (
        <div className="recipe-list-header list-header">
            <span className="recipe-list-item">Recipe Name</span>
            <span className="recipe-list-item">Difficulty</span>
            <span className="recipe-list-item">Length</span>
            <span className="recipe-list-item">Author</span>
            <span className="recipe-list-item">Source</span>
            <span className="recipe-list-item icon-cell">
                <EditButton onClickFn={props.onClickFn} onClickParam={props.onClickParam}/>
            </span>
        </div>
    )
}

RecipeListHeader.defaultProps = {
    onClickParam: true
}

export default RecipeListHeader;
