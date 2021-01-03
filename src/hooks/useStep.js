import {useReducer, useState} from 'react';
import {v4 as uuid} from "uuid";
import {defaultStep} from "../data/defaultValues";

function stepReducer(state, action) {
    switch (action.type) {
        case 'SUBMIT': {
            console.log("Start of handleSubmit()");

            // TODO: Replace validation with formik & yup
            // stepNumber validation
            if (state.number <= 0) {
                updateStep({number: nextStepNumber})
                return false;
            }

            // Require values for step# and text/action
            if (state.number.toString() === ""
                || state.number.isNaN
                || state.text === ""
                || state.text.isNaN) {
                return false;
            }

            // Don't refresh the page
            // event.preventDefault();

            // Create an object that's congruent with the Step data model
            // TODO: Move then_wait logic into the useStep hook so we don't need
            //       to create a new object that mirrors the data model
            let newStepObject = {
                step_id: uuid(),
                number: Number(state.number),
                text: state.text,
                then_wait: (Number(state.thenWaitHH) * 3600) + (Number(state.thenWaitMM) * 60),
                note: state.note
            };

            console.log("New Step:", newStepObject);

            // Send this new step to the parent so it can update the backend
            addStepToRecipe(newStepObject);

            // Reset the form to its default
            updateStep({...defaultStep, number: nextStepNumber})
        }

        case 'handleChange': {
            updateStep({[event.target.name]: event.target.value})
        }
    }
}

function useStep(initialState) {
    // TODO: Use a reducer instead of state
    const [step, updateStep] = useState(initialState);

    function handleChange(event) {
        updateStep({[event.target.name]: event.target.value})
    }

    function handleSubmit(event, step, addStepToRecipe, nextStepNumber) {


    }

    return [step, updateStep, handleChange, handleSubmit]
}

export default useStep;
