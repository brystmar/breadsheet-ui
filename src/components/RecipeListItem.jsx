import React from "react";
import { Link } from "react-router";
import map_difficulty_to_icon from "../helpers/map_difficulty_to_icon";
import AttrSource from "./attributes/AttrSource";


export default function RecipeListItem({ recipe_id = 0, name = "", author = "", source = "", url = "", difficulty = "Beginner", solve_for_start = true, length = 0, highlight = true }) {
    return (
        <div className={"recipe-list-row".concat(highlight ? " list-row-highlighted" : "")}>
            <span className="recipe-list-cell col-name">
                <Link to={`/${recipe_id}`}>{name}</Link>
            </span>

            <span className="recipe-list-cell col-difficulty">
                {map_difficulty_to_icon(difficulty)}
            </span>

            <span className="recipe-list-cell col-length">
                {length}
            </span>

            <span className="recipe-list-cell col-author">
                {author ? author : "--"}
            </span>

            <AttrSource
                name={source}
                url={url}
                extraClassString="recipe-list-cell col-source"
            />

        </div>
    )
}
