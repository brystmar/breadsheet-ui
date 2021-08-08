import React, { useState, useEffect } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { convert_text_using_provided_list } from "../helpers/convert_text_functions";
import { defaultConvertTextState, convertTextPlaceholder } from "../data/defaultValues";


export default function ConvertTextControls(props) {
    const [ state, updateState ] = useState(defaultConvertTextState);
    const [ showConfirmation, updateShowConfirmation ] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        if (!props.hasData) {
            // Prevent conversion if we don't have the replacement text data
            updateState({
                ...state,
                [name]: value
            })
        } else if (name === "inputIngredients") {
            updateState({
                ...state,
                [name]:            value,
                outputIngredients: convert_text_using_provided_list(value, props.ingredientsList)
            });
        } else if (name === "inputDirections") {
            updateState({
                ...state,
                [name]:           value,
                outputDirections: convert_text_using_provided_list(value, props.directionsList)
            })
        }
    }

    // Timeout for displaying the copy-to-clipboard confirmation
    useEffect(() => {
        if (showConfirmation) {
            const timeout = setTimeout(() => {
                updateShowConfirmation(false)
            }, 750)

            return () => clearTimeout(timeout)
        }
    }, [ showConfirmation ])

    // When hasData flips to true, convert any text already in the input boxes
    useEffect(() => {
        updateState({
            ...state,
            outputIngredients: convert_text_using_provided_list(state.inputIngredients, props.ingredientsList),
            outputDirections:  convert_text_using_provided_list(state.inputDirections, props.directionsList)
        })
    }, [ state.hasData, props.ingredientsList, props.directionsList ])

    return (
        <div className="text-conversion-inputs-container">
            <span className="text-conversion-group">
                <label htmlFor="inputIngredients" className="text-conversion-label">
                    Ingredients Input
                </label>
                <textarea
                    name="inputIngredients"
                    id="inputIngredients"
                    className="text-conversion-box text-conversion-input"
                    value={state.inputIngredients}
                    placeholder={convertTextPlaceholder.inputIngredients}
                    onChange={(event) => handleChange(event)}
                    autoFocus={true}
                    tabIndex={1}
                    rows={state.textRows}
                    cols={state.textCols}
                />
            </span>

            <span className="text-conversion-group">
                <label htmlFor="outputIngredients" className="text-conversion-label">
                    Ingredients Output
                </label>
                <textarea
                    name="outputIngredients"
                    id="outputIngredients"
                    className="text-conversion-box text-conversion-output"
                    value={state.outputIngredients}
                    placeholder={convertTextPlaceholder.outputIngredients}
                    readOnly={true}
                    rows={state.textRows}
                    cols={state.textCols}
                />
            </span>

            <span className="text-conversion-group">
                <label htmlFor="inputDirections" className="text-conversion-label">
                    Directions Input
                </label>
                <textarea
                    name="inputDirections"
                    id="inputDirections"
                    className="text-conversion-box text-conversion-input"
                    value={state.inputDirections}
                    placeholder={convertTextPlaceholder.inputDirections}
                    onChange={(event) => handleChange(event)}
                    tabIndex={2}
                    rows={state.textRows}
                    cols={state.textCols}
                />
            </span>

            <span className="text-conversion-group">
                <label htmlFor="outputDirections" className="text-conversion-label">
                    Directions Output
                </label>
                <textarea
                    name="outputDirections"
                    id="outputDirections"
                    className="text-conversion-box text-conversion-output"
                    value={state.outputDirections}
                    placeholder={convertTextPlaceholder.outputDirections}
                    readOnly={true}
                    rows={state.textRows}
                    cols={state.textCols}
                />
            </span>

            <span className="button-group">
                <CopyToClipboard
                    text={(state.outputIngredients + "\n" + state.outputDirections).trim() + "\n"}
                    onCopy={() => updateShowConfirmation(true)}
                >
                    <span id="confirmation-container">
                        <button
                            type="button"
                            id="confirmation"
                            name="copyToClipboard"
                            className={!showConfirmation ? "btn btn-save btn-clipboard" :
                                "btn btn-save btn-clipboard checkmark"}
                            tabIndex={3}
                            disabled={state.hasData}
                        >
                            {!showConfirmation ? "Copy to Clipboard" : ""}
                        </button>
                    </span>
                </CopyToClipboard>
            </span>

            <span className="button-group">
                <button
                    type="button"
                    name="resetForm"
                    className="btn btn-default btn-reset"
                    onClick={() => updateState(defaultConvertTextState)}
                    tabIndex={4}
                >
                    Reset
                </button>
            </span>
        </div>
    )
}

ConvertTextControls.defaultProps = {
    ingredientsList: [],
    directionsList:  [],
    hasData:         false
}
