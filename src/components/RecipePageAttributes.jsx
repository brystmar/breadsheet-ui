import React from "react";
import seconds_to_string from "../helpers/time_display_functions";
import map_difficulty_to_icon from "../helpers/map_difficulty_to_icon";
import AttrSource from "./attributes/AttrSource";


export default function RecipePageAttributes({ difficulty = "Intermediate", author = "", source = "", url = "", length = 0, toggleEditMode }) {
    return (
        <div className="recipe-attributes-and-button-container">
            <div className="recipe-attributes-container">
                <div className="recipe-attribute attr-difficulty">
                    <h3 className="attribute-label">Difficulty</h3>
                    <span className="attribute-value">
                        {difficulty} {map_difficulty_to_icon(difficulty)}
                    </span>
                </div>

                <div className="recipe-attribute attr-author">
                    <h3 className="attribute-label">Author</h3>
                    <span className="attribute-value">
                        {author}
                    </span>
                </div>

                <div className="recipe-attribute attr-length">
                    <h3 className="attribute-label">Length</h3>
                    <span className="attribute-value">
                        {seconds_to_string(length ? length : 0, true, true, true)}
                    </span>
                </div>

                <div className="recipe-attribute attr-source">
                    <h3 className="attribute-label">Source</h3>
                    <AttrSource
                        name={source}
                        url={url}
                        extraClassString="attribute-value"
                    />
                </div>
            </div>
            {/*<div className="edit-button-container">*/}
            {/*    <BtnEdit onClickFn={props.toggleEditMode}/>*/}
            {/*    /!*TODO: Button doesn't toggle off *!/*/}
            {/*</div>*/}
        </div>
    )
}


