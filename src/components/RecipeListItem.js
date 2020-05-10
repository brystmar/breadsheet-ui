import React from 'react';
import {Link} from 'react-router-dom';

function RecipeListItem(props) {
    let difficulty;

    if (props.difficulty === "Beginner") {
        difficulty = <img src="./difficulty-1-tsp.png"
                          alt={"Difficulty: " + props.difficulty}
                          className="difficulty-icon"/>

    } else if (props.difficulty === "Intermediate") {
        difficulty = <img src="./difficulty-2-tsp.png"
                          alt={"Difficulty: " + props.difficulty}
                          className="difficulty-icon"/>

    } else if (props.difficulty === "Advanced") {
        difficulty = <img src="./difficulty-3-tsp.png"
                          alt={"Difficulty: " + props.difficulty}
                          className="difficulty-icon"/>

    } else if (props.difficulty === "Expert") {
        difficulty = <img src="./difficulty-4-tsp.png"
                          alt={"Difficulty: " + props.difficulty}
                          className="difficulty-icon"/>
    }

    return (
        <tr className="recipe-table-list-item">
            <td className="recipe-list-item-name">
                <Link to={`/${props.recipe_id}`}>{props.name}</Link>
            </td>

            <td className="recipe-list-item-difficulty">
                {difficulty}
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
