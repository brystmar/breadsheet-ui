import React from 'react';
import seconds_to_string from '../scripts/time_display_functions';
import map_difficulty_to_icon from '../scripts/map_difficulty_to_icon';
import AttrSource from "./attributes/AttrSource";

function RecipePageAttributes(props) {
    return (
        <div className="recipe-attributes-container">
            <div className="recipe-attribute">
                <h3 className="attribute-label">Difficulty</h3>
                <span className="attribute-value">
                    {props.difficulty} {map_difficulty_to_icon(props.difficulty)}
                </span>
            </div>

            <div className="recipe-attribute">
                <h3 className="attribute-label">Author</h3>
                <span className="attribute-value">
                    {props.author}
                </span>
            </div>

            <div className="recipe-attribute">
                <h3 className="attribute-label">Length</h3>
                <span className="attribute-value">
                    {seconds_to_string(props.length ? props.length : 0, true, true, true)}
                </span>
            </div>

            <div className="recipe-attribute">
                <h3 className="attribute-label">Source</h3>
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
