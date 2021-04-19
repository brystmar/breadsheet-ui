import React, { useEffect } from "react";
import BtnAdd from "./buttons/BtnAdd";
import useStep from "../hooks/useStep";
import reallocate_hh_mm from "../helpers/reallocate_hh_mm";


export default function AddStep(props) {
    const [ state, dispatch ] = useStep(props.nextStep);
    // console.log(props);

    // Update nextStep when necessary
    useEffect(() => dispatch({
        type:    "UPDATE_STEP_NUMBER",
        payload: props.nextStep
    }), [ props.nextStep, dispatch ])

    function enforceValidStepNumber(currentNumber) {
        // Replaces the step number in case the user deletes it
        // if (currentNumber === ""
        //     || currentNumber.isNaN
        //     || Number(currentNumber) <= 0) {
        //     dispatch({
        //         type: "UPDATE_STEP_NUMBER",
        //         payload: {nextStepNumber: props.nextStep}
        //     });
        // }
    }

    return (
        <div className="add-step-container">
            <BtnAdd
                btnText="New Step"
                altText="Toggles display of the 'Add new step' form"
                isCollapsed={!props.hidden}
                onClickFn={props.toggleEditMode}
            />

            <form
                className={props.hidden ? "add-step-form hidden" : "add-step-form"}
                id="add-step-form"
                onSubmit={(event) => {
                    console.log("AddStep Form submitted via BtnSubmit button.");

                    // Don't refresh the page
                    event.preventDefault();

                    // Call the submit function
                    dispatch({
                        type:    "HANDLE_SUBMIT",
                        payload: {
                            nextStepNumber:  props.nextStep,
                            addStepToRecipe: props.addStepToRecipe
                        }
                    });

                    // Ensure edit mode on the parent is false
                    props.toggleEditMode(false);
                }}
            >
                <span className="add-step-form-group">
                    <label htmlFor="number" className="add-step-form-label">
                        Step
                    </label>
                    <span className="add-step-form-input-group">
                        <input
                            className="add-step-form-input-number"
                            type="number"
                            min="1"
                            max="99"
                            name="stepNumber"
                            id="number"
                            placeholder="#"
                            value={state.number}
                            onChange={(event) =>
                                dispatch({
                                    type:    "HANDLE_NUMBER_CHANGE",
                                    payload: event.target.value
                                })}
                            onBlur={() => enforceValidStepNumber(state.number)}
                            required={true}
                        />
                    </span>
                </span>

                <span className="add-step-form-group">
                    <label htmlFor="action" className="add-step-form-label">
                        Action
                    </label>
                    <input
                        className="add-step-form-input-group"
                        type="text"
                        name="text"
                        id="action"
                        placeholder="Mix the dough"
                        value={state.text}
                        onChange={(event) =>
                            dispatch({ type: "HANDLE_TEXT_CHANGE", payload: event.target.value })}
                        required={true}
                    />
                </span>

                <span className="add-step-form-group">
                    <label htmlFor="then-wait-hh" className="add-step-form-label">
                        Then Wait...
                    </label>
                    <span className="add-step-form-input-group">
                        <input
                            className="then-wait-hh-input"
                            type="number"
                            min="0"
                            max="99"
                            name="thenWaitHH"
                            id="then-wait-hh"
                            placeholder="h"
                            value={state.thenWaitHH}
                            onChange={(event) =>
                                dispatch({
                                    type:    "HANDLE_HH_CHANGE",
                                    payload: Number(event.target.value)
                                })}
                            onBlur={(event) => {
                                dispatch({
                                    type:    "HANDLE_HHMM_CHANGE",
                                    payload: reallocate_hh_mm(event, state.thenWaitHH, state.thenWaitMM)
                                })
                            }}
                        />
                        <span className="then-wait-helper-text">hrs</span>

                        <input
                            className="then-wait-mm-input"
                            type="number"
                            min="0"
                            max="59"
                            name="thenWaitMM"
                            id="then-wait-mm"
                            placeholder="m"
                            value={state.thenWaitMM}
                            onChange={(event) =>
                                dispatch({
                                    type:    "HANDLE_MM_CHANGE",
                                    payload: event.target.value
                                })}
                            onBlur={(event) => {
                                dispatch({
                                    type:    "HANDLE_HHMM_CHANGE",
                                    payload: reallocate_hh_mm(event, state.thenWaitHH, state.thenWaitMM)
                                })
                            }}
                        />
                        <span className="then-wait-helper-text">min</span>
                    </span>
                </span>

                <span className="add-step-form-group">
                    <label htmlFor="note" className="add-step-form-label">
                        Note
                    </label>
                    <input
                        className="add-step-form-input-group"
                        type="text"
                        name="note"
                        id="note"
                        placeholder="Rest until size doubles, 2 to 4 hrs"
                        value={state.note}
                        onChange={(event) =>
                            dispatch({ type: "HANDLE_NOTE_CHANGE", payload: event.target.value })}
                    />
                </span>

                <span className="add-step-form-group button-group">
                    <button
                        type="submit"
                        name="saveNewStep"
                        className="btn btn-submit"
                        disabled={props.disabled}
                        onClick={props.onClickFn}
                    >
                        Submit
                    </button>
                </span>
            </form>
        </div>
    )
}

AddStep.defaultProps = {
    hidden:   true,
    nextStep: 0
}
