import React from 'react';
import seconds_to_string from '../scripts/time_display_functions';
import map_difficulty_to_icon from '../scripts/map_difficulty_to_icon';

function RecipePageAttributes(props) {
    return (
        <div className="recipe-attributes-container">
            <div className="recipe-attribute">
                <span className="attribute-label">Difficulty</span>
                <span className="attribute-value">
                    {props.difficulty} {map_difficulty_to_icon(props.difficulty)}
                </span>
            </div>

            <div className="recipe-attribute">
                <span className="attribute-label">Author</span>
                <span className="attribute-value">
                    {props.author}
                </span>
            </div>

            <div className="recipe-attribute">
                <span className="attribute-label">Total Time</span>
                <span className="attribute-value">
                    {seconds_to_string(props.length ? props.length : 0, true, true, true)}
                </span>
            </div>

            <div className="recipe-attribute">
                <span className="attribute-label">Source</span>
                <span className="attribute-value">
                    {props.source}
                </span>
            </div>
        </div>
    )
}

export default RecipePageAttributes;
