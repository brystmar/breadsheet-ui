import React, { useState } from "react";
import { MDBDataTable } from "mdbreact";
import { format_text_replacement_list_items } from "../scripts/convert_text_functions"
import { defaultConversionListContainerState } from "../data/defaultValues";


export default function ConversionListContainer(props) {
    const [ state, updateState ] = useState(defaultConversionListContainerState);

    let tableData = {
        columns: [
            {
                label: "Find",
                field: "old",
                sort:  "asc",
                width: 210
            },
            {
                label: "Replace",
                field: "new",
                sort:  "asc",
                width: 210
            }
        ],
        rows:    state.scope === "ingredients" ?
                     format_text_replacement_list_items(props.ingredientsList) :
                     format_text_replacement_list_items(props.directionsList)
    }

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

                <MDBDataTable
                    scrollY
                    striped
                    small
                    responsiveSm
                    hover
                    bordered
                    maxHeight="600px"
                    className="replacement-list-item"
                    data={tableData}
                    entries={12}
                />
            </span>
        </div>
    )
}

ConversionListContainer.defaultProps = {
    ingredientsList: [],
    directionsList:  [],
    hasData:         false
}
