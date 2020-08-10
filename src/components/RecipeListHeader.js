import React from 'react';
import BtnEdit from './buttons/BtnEdit';

function RecipeListHeader(props) {
    return (
        <div className="recipe-list-row list-header">
            <span className="recipe-list-cell">Recipe Name</span>
            <span className="recipe-list-cell">Difficulty</span>
            <span className="recipe-list-cell">Length</span>
            <span className="recipe-list-cell">Author</span>
            <span className="recipe-list-cell">Source</span>
            <span className="recipe-list-cell icon-cell">
                <BtnEdit onClickFn={props.onClickFn} onClickParam={props.onClickParam}/>
            </span>
        </div>
    )
}

RecipeListHeader.defaultProps = {
    onClickParam: true
}

export default RecipeListHeader;
