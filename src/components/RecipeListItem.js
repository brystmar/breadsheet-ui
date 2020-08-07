import React from 'react';
import {Link} from 'react-router-dom';
import map_difficulty_to_icon from '../scripts/map_difficulty_to_icon';

function RecipeListItem(props) {
    return (
        <div className="recipe-list-item">
            <span><Link to={`/${props.recipe_id}`}>{props.name}</Link></span>
            <span>{map_difficulty_to_icon(props.difficulty)}</span>
            <span>{props.length}</span>
            <span>{props.author ? props.author : "--"}</span>
            <span>{props.source ? props.source : "--"}</span>

            <span>
                <img alt="Delete recipe"
                     src="./icons/button_minus.png"
                     className="icon icon-delete"
                     onClick={() => props.deleteRecipe(props.recipe_id)}
                     hidden={props.hidden}/>
            </span>
        </div>
    )
}

RecipeListItem.defaultProps = {
    recipe_id: 0,
    name: "",
    author: "",
    source: "",
    url: "",
    difficulty: "Beginner",
    solve_for_start: true,
    length: 0,
    hidden: true
}

export default RecipeListItem;
