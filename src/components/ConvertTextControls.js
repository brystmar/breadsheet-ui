import React, {useState} from 'react';
import {CSSTransition} from 'react-transition-group';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import convert_text_using_provided_list from '../scripts/convert_text_functions';
import {defaultConvertTextState, convertTextPlaceholder} from "../data/defaultValues";


function ConvertTextControls(props) {
    const [state, updateState] = useState(defaultConvertTextState);

    function handleChange(event) {
        const {name, value} = event.target;

        if (!props.hasData) {
            // If we don't have the replacement text lists, users can enter data but the app
            //   won't try to convert anything.
            updateState({
                ...state,
                [name]: value
            })
        } else if (name === "inputIngredients") {
            updateState({
                [name]: value,
                outputIngredients: convert_text_using_provided_list(value, props.ingredientsList)
            });
        } else if (name === "inputDirections") {
            updateState({
                [name]: value,
                outputDirections: convert_text_using_provided_list(value, props.directionsList)
            })
        }
    }

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
                    text={(state.outputIngredients + "\n\n" + state.outputDirections).trim()}
                    onCopy={() => updateState({transition: !state.transition})}
                >
                    <button
                        type="button"
                        name="copyToClipboard"
                        className="btn btn-save btn-clipboard"
                        tabIndex={3}
                        disabled={state.hasData}
                    >
                        Copy to Clipboard
                    </button>
                </CopyToClipboard>

                {/*TODO: Now that I understand CSS, it's time to replace this module*/}
                <CSSTransition
                    in={state.transition}
                    timeout={500}
                    classNames="clipboard-confirmation"
                    onEntered={() => updateState({transition: !state.transition})}
                >
                    <span className="clipboard-confirmation">
                        Copied!
                    </span>
                </CSSTransition>
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
    directionsList: [],
    hasData: false
}

export default ConvertTextControls;
