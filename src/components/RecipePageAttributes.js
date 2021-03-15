import React from "react";
import seconds_to_string from "../helpers/time_display_functions";
import map_difficulty_to_icon from "../helpers/map_difficulty_to_icon";
import AttrSource from "./attributes/AttrSource";


export default function RecipePageAttributes(props) {
    return (
        <div className="recipe-attributes-and-button-container">
            <div className="recipe-attributes-container">
                <div className="recipe-attribute attr-difficulty">
                    <h3 className="attribute-label">Difficulty</h3>
                    <span className="attribute-value">
                        {props.difficulty} {map_difficulty_to_icon(props.difficulty)}
                    </span>
                </div>

                <div className="recipe-attribute attr-author">
                    <h3 className="attribute-label">Author</h3>
                    <span className="attribute-value">
                        {props.author}
                    </span>
                </div>

                <div className="recipe-attribute attr-length">
                    <h3 className="attribute-label">Length</h3>
                    <span className="attribute-value">
                        {seconds_to_string(props.length ? props.length : 0, true, true, true)}
                    </span>
                </div>

                <div className="recipe-attribute attr-source">
                    <h3 className="attribute-label">Source</h3>
                    <AttrSource
                        name={props.source}
                        url={props.url}
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

RecipePageAttributes.defaultProps = {
    difficulty: "Intermediate",
    author:     "",
    source:     "",
    url:        "",
    length:     0
}
