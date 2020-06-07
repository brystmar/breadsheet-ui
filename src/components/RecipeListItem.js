import React from 'react';
import {Link} from 'react-router-dom';
import map_difficulty_to_icon from '../scripts/map_difficulty_to_icon';

function RecipeListItem(props) {
    return (
        <tr className="recipe-table-list-item">
            <td className="recipe-list-item-name">
                <Link to={`/${props.recipe_id}`}>{props.name}</Link>
            </td>

            <td className="recipe-list-item-difficulty">
                {map_difficulty_to_icon(props.difficulty)}
            </td>
            <td className="recipe-list-item-length">{props.length}</td>
            <td className="recipe-list-item-author">{props.author ? props.author : "--"}</td>
            <td className="recipe-list-item-source">{props.source ? props.source : "--"}</td>

            <td className="delete-icon-column">
                <img alt="Delete recipe"
                     src="./button_minus.png"
                     className="delete-recipe-icon"
                     onClick={() => props.deleteRecipe(props.recipe_id)}
                     hidden={props.hidden}/>
            </td>
        </tr>
    )
}

RecipeListItem.defaultProps = {
    recipe_id: 0,
    name: "",
    author: "",
    source: "",
    difficulty: "Beginner",
    solve_for_start: true,
    length: 0,
    hidden: true
}

export default RecipeListItem;
