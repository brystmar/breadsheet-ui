import { useReducer } from 'react';
import { v4 as uuid } from "uuid";
import { defaultStep } from "../data/defaultValues";

function stepReducer(state, action) {
    switch (action.type) {
        case 'UPDATE_STEP_NUMBER': {
            return {
                ...state,
                number: action.payload
            }
        }

        case 'HANDLE_SUBMIT': {
            // TODO: This is being called twice, adding a duplicate step each time
            // console.log("Start of dispatch HANDLE_SUBMIT");

            // TODO: Replace validation with formik & yup
            // stepNumber validation
            if (state.number <= 0) {
                return { ...state, number: action.payload.nextStepNumber }
            }

            // Require values for step# and text/action
            if (state.number.toString() === ""
                || state.number.isNaN
                || state.text === ""
                || state.text.isNaN) {
                return false;
            }

            // Create an object that's congruent with the Step data model
            let newStepObject = {
                step_id:   uuid(),
                number:    Number(state.number),
                text:      state.text,
                then_wait: (Number(state.thenWaitHH) * 3600) + (Number(state.thenWaitMM) * 60),
                note:      state.note
            };

            // console.log("New Step:", newStepObject);

            // Send this new step to the parent so it can update the backend
            action.payload.addStepToRecipe(newStepObject);

            // Reset the form to its default
            return { ...state, number: action.payload.nextStepNumber }
        }

        case 'HANDLE_NUMBER_CHANGE': {
            // console.log("Called HANDLE_NUMBER_CHANGE w/action:", action);
            return {
                ...state,
                number: action.payload
            }
        }

        case 'HANDLE_TEXT_CHANGE': {
            // console.log("Called HANDLE_TEXT_CHANGE w/action:", action);
            return {
                ...state,
                text: action.payload
            }
        }

        case 'HANDLE_HH_CHANGE': {
            // console.log("Called HANDLE_HH_CHANGE w/action:", action);
            return {
                ...state,
                thenWaitHH: action.payload
            }
        }

        case 'HANDLE_MM_CHANGE': {
            // console.log("Called HANDLE_MM_CHANGE w/action:", action);
            return {
                ...state,
                thenWaitMM: action.payload
            }
        }

        case 'HANDLE_HHMM_CHANGE': {
            // console.log("Called HANDLE_HHMM_CHANGE w/action:", action);
            return {
                ...state,
                thenWaitHH: action.payload.thenWaitHH,
                thenWaitMM: action.payload.thenWaitMM
            }
        }

        case 'HANDLE_NOTE_CHANGE': {
            // console.log("Called HANDLE_NOTE_CHANGE w/action:", action);
            return {
                ...state,
                note: action.payload
            }
        }

        default: {
            console.log("stepReducer was called w/invalid action.type:", action.type)
            return state
        }
    }
}

export default function useStep(nextStepNumber) {
    const [ state, dispatch ] = useReducer(stepReducer, {
        ...defaultStep,
        number: nextStepNumber
    })

    return [ state, dispatch ]
}
