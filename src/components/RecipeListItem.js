import React from 'react';
import {Link} from 'react-router-dom';
import map_difficulty_to_icon from '../scripts/map_difficulty_to_icon';

function RecipeListItem(props) {
    let source = props.source ? props.source : "--";
    let sourceWithLink = source, sourceClass = "recipe-list-item";

    // Apply the link and adjust the class
    if (props.url) {
        sourceClass = "text-with-ext-link-icon"
        sourceWithLink =
            <a href={props.url}>
                {source}
                <img src="./icons/external-link-alt-solid.svg"
                     alt="Link opens in a separate tab"
                     className="icon icon-ext-link"/>
            </a>
    }

    return (
        <div className="recipe-list">
            <span className="recipe-list-item"><Link to={`/${props.recipe_id}`}>{props.name}</Link></span>
            <span className="recipe-list-item">{map_difficulty_to_icon(props.difficulty)}</span>
            <span className="recipe-list-item">{props.length}</span>
            <span className="recipe-list-item">{props.author ? props.author : "--"}</span>
            <span className={sourceClass}>{sourceWithLink}</span>

            <span className="recipe-list-item icon-cell">
                <button className="btn-delete"
                        onClick={() => props.deleteRecipe(props.recipe_id)}
                        hidden={props.hidden}>
                    <img alt="Delete recipe"
                         src="./icons/button_minus.png"
                         className="icon icon-transparent icon-delete"/>
                </button>
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
