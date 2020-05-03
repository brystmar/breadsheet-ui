import React from 'react';
import { Link } from 'react-router-dom';

function RecipeListItem(props) {
    return (
        <tr className="recipe-table-list-item">
            <td className="delete-recipe-button-column"
                hidden={props.hidden}>
                <img alt="Delete recipe"
                     src="./button_minus.png"
                     className="delete-recipe-button"
                     onClick={() => props.deleteRecipe(props.recipe_id)}/>
            </td>
            <td className="recipe-list-item-name">
                <Link to={`/${props.recipe_id}`}>{props.name}</Link>
            </td>
            <td className="recipe-list-item-difficulty">{props.difficulty}</td>
            <td className="recipe-list-item-length">{props.length}</td>
            <td className="recipe-list-item-author">{props.author ? props.author : "--"}</td>
            <td className="recipe-list-item-source">{props.source ? props.source : "--"}</td>
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
