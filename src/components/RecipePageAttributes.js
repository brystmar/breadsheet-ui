import React from 'react';
import seconds_to_string from '../scripts/time_display_functions';
import map_difficulty_to_icon from '../scripts/map_difficulty_to_icon';
import AttrSource from "./attributes/AttrSource";

function RecipePageAttributes(props) {
    return (
        <div className="recipe-attributes-container">
            <div className="recipe-attribute attr-difficulty">
                <span className="attribute-label">Difficulty</span>
                <span className="attribute-value">
                    {props.difficulty} {map_difficulty_to_icon(props.difficulty)}
                </span>
            </div>

            <div className="recipe-attribute attr-author">
                <span className="attribute-label">Author</span>
                <span className="attribute-value">
                    {props.author}
                </span>
            </div>

            <div className="recipe-attribute attr-length">
                <span className="attribute-label">Length</span>
                <span className="attribute-value">
                    {seconds_to_string(props.length ? props.length : 0, true, true, true)}
                </span>
            </div>

            <div className="recipe-attribute attr-source">
                <span className="attribute-label">Source</span>
                <AttrSource name={props.source}
                            url={props.url}
                            extraClassString="attribute-value"/>
            </div>
        </div>
    )
}

RecipePageAttributes.defaultProps = {
    difficulty: "Intermediate",
    author: "",
    source: "",
    url: "",
    length: 0
}

export default RecipePageAttributes;
