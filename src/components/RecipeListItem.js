import React from 'react';
import {Link} from 'react-router-dom';
import map_difficulty_to_icon from '../scripts/map_difficulty_to_icon';

function RecipeListItem(props) {
    const source = props.source ? props.source : "--";
    const sourceWithLink = props.url ?
        <a href={props.url}>
            {source}
            <img src="./icons/external-link-alt-solid.svg"
                 alt="Link opens in a separate tab"
                 className="icon icon-ext-link"/>
        </a>
        : source;

    return (
        <div className="recipe-list-item">
            <span><Link to={`/${props.recipe_id}`}>{props.name}</Link></span>
            <span>{map_difficulty_to_icon(props.difficulty)}</span>
            <span>{props.length}</span>
            <span className="recipe-list-item-author">{props.author ? props.author : "--"}</span>
            <span className="recipe-list-item-source">{sourceWithLink}</span>

            <div className="btn-delete-container icon-cell">
                <button className="btn-delete"
                        onClick={() => props.deleteRecipe(props.recipe_id)}
                        hidden={props.hidden}>
                    <img alt="Delete recipe"
                         src="./icons/button_minus.png"
                         className="icon icon-delete"/>
                </button>
            </div>
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
