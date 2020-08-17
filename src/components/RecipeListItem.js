import React from 'react';
import {Link} from 'react-router-dom';
import map_difficulty_to_icon from '../scripts/map_difficulty_to_icon';
import AttrSource from './attributes/AttrSource';

function RecipeListItem(props) {
    return (
        <div className={props.highlight ? "recipe-list-row list-row-highlighted" : "recipe-list-row"}>
            <span className="recipe-list-cell col-name">
                <Link to={`/${props.recipe_id}`}>{props.name}</Link>
            </span>

            <span className="recipe-list-cell col-difficulty">
                {map_difficulty_to_icon(props.difficulty)}
            </span>

            <span className="recipe-list-cell col-length">
                {props.length}
            </span>

            <span className="recipe-list-cell col-author">
                {props.author ? props.author : "--"}
            </span>

            <AttrSource name={props.source}
                        url={props.url}
                        extraClassString="recipe-list-cell col-source"/>

            <span className="recipe-list-cell col-button icon-cell">
                <button className="btn-delete"
                        onClick={() => props.deleteRecipe(props.recipe_id)}
                        hidden={props.hidden}>
                    <img alt="Delete recipe"
                         src="./icons/button_minus.png"
                         className="icon icon-delete"/>
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
    hidden: true,
    highlight: true
}

export default RecipeListItem;
