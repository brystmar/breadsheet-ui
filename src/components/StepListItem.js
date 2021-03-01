import React, { useState, useEffect } from "react";
import { seconds_to_hhmm, pad } from "../helpers/time_display_functions";
import Moment from "react-moment";


export default function StepListItem(props) {
    const [ state, updateState ] = useState({
        thenWaitHH: "00",
        thenWaitMM: "00"
    })

    useEffect(() => {
        let [ hours, minutes ] = seconds_to_hhmm(props.then_wait);

        updateState({
            thenWaitHH: pad(hours),
            thenWaitMM: pad(minutes)
        })
    }, [ props.then_wait ])

    function handleChange(event) {
        const { name, value } = event.target;

        updateState({
            ...state,
            [name]: Number(value)
        });

        // If a thenWaitXX value changes, update the state on RecipePage
        if (name === "thenWaitHH") {
            props.handleStepLengthChange(event, props.stepNumber,
                (value * 3600) + (state.thenWaitMM * 60));

        } else if (name === "thenWaitMM") {
            props.handleStepLengthChange(event, props.stepNumber,
                (state.thenWaitHH * 3600) + (value * 60));
        }
    }

    function padValue(event) {
        // Adds zero-padding to single digit numbers.
        // Also re-calculates hours & minutes if ThenWaitMM >= 60.
        const { name, value } = event.target;
        const numValue = Number(value);

        // Re-allocate minutes if ThenWaitMM value is >= 60
        if (name === "thenWaitMM" && numValue >= 60) {
            let hours = Math.floor(numValue / 60) + Number(state.thenWaitHH);
            let minutes = numValue % 60;

            updateState({
                thenWaitHH: pad(hours),
                thenWaitMM: pad(minutes)
            })
        } else if (numValue >= 0 && numValue < 10) {
            updateState({
                ...state,
                [name]: pad(value)
            })
        } else if (value.length >= 3 && value.toString().charAt(0) === "0") {
            // If user enters a superfluous leading zero
            updateState({
                ...state,
                [name]: numValue
            })
        }
    }

    return (
        <div className={"step-list-row".concat(props.highlight ? " list-row-highlighted" : "")}>
            <span className="step-list-cell right-justify col-step">
                {props.stepNumber.toString().concat(".")}
            </span>

            <span className="step-list-cell col-when">
                <Moment format="ddd HH:mm">{props.when}</Moment>
            </span>

            <span className="step-list-cell col-action">
                {props.text}
            </span>

            <span className="step-list-cell col-then">
                <input
                    type="number"
                    min="00"
                    max="99"
                    name="thenWaitHH"
                    value={state.thenWaitHH}
                    onChange={handleChange}
                    onBlur={padValue}
                    className="then-wait-hh-input"
                />
                :
                <input
                    type="number"
                    min="00"
                    max="59"
                    name="thenWaitMM"
                    value={state.thenWaitMM}
                    onChange={handleChange}
                    onBlur={padValue}
                    className="then-wait-mm-input"
                />
            </span>

            <span className="step-list-cell col-note">
                {props.note}
            </span>
        </div>
    )
}

StepListItem.defaultProps = {
    step_id:    0,
    stepNumber: 0,
    text:       "",
    then_wait:  0,
    note:       "",
    hidden:     true
}
