import React, { useState } from "react";
import { format_text_replacement_list_items } from "../helpers/convert_text_functions"
import { defaultConversionListContainerState } from "../data/defaultValues";


export default function ConversionListContainer({ ingredientsList = [], directionsList = [], hasData = false }) {
    const [ state, updateState ] = useState(defaultConversionListContainerState);

    const rows = state.scope === "ingredients" ?
        format_text_replacement_list_items(ingredientsList) :
        format_text_replacement_list_items(directionsList)

    return (
        <div className="replacement-list-container">
            <h3
                className="replacement-list-header"
                onClick={() => updateState({ isCollapsed: !state.isCollapsed })}
            >
                What's being replaced?
            </h3>
            <span
                className={state.isCollapsed ? "replacement-list-content hidden" :
                    "replacement-list-content"}
            >
                <p className="toggle-replacements">
                    Replacements for
                    <button
                        name="scopeChange"
                        className="btn btn-default-reverse btn-replacement-toggle"
                        onClick={() => {
                            if (state.scope === "ingredients") {
                                updateState({ scope: "directions" })
                            } else {
                                updateState({ scope: "ingredients" })
                            }
                        }}
                    >
                        {state.scope === "ingredients" ? "Ingredients" : "Directions"}
                        <img
                            src="./icons/reverse-solid.svg"
                            alt="Toggle the replacements list displayed"
                            className="icon-on-btn"
                        />
                    </button>
                </p>

                <div className="replacement-list-scroll">
                    <table className="replacement-list-item">
                        <thead>
                            <tr>
                                <th>Find</th>
                                <th>Replace</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={index} className={index % 2 === 0 ? "replacement-row-even" : ""}>
                                    <td>{row.old}</td>
                                    <td>{row.new}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </span>
        </div>
    )
}
