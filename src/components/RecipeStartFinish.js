import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import "../styles/start-finish.sass";


export default function RecipeStartFinish(props) {
    const propsData = `/PROPS/ s4s: ${props.solve_for_start}, len: ${props.length}, s_time: ${props.start_time}`;
    console.log(propsData);

    function convertToFinish(startTime) {
        console.log(`Starting convertToFinish for: ${startTime}, ${typeof (startTime)}, & length: ${props.length}.`)
        if (typeof (startTime) !== typeof (new Date(0).getTime())) {
            console.error(`cTF: Incorrect data type provided -- ${typeof (startTime)}.`)
            return startTime
        }

        return moment(startTime).add(props.length, 'seconds').valueOf();
    }

    // TODO: Need to simplify by completely removing finishTime from this component.
    //  Only thing that should be in local state is startTime.
    const [ state, updateState ] = useState({
        startTime:  moment(props.start_time).valueOf(),
        finishTime: convertToFinish(props.start_time)
    });

    const refSaveText = useRef(null);

    useEffect(() => {
        updateState({
            startTime:  moment(props.start_time).valueOf(),
            finishTime: convertToFinish(props.start_time)
        })
    }, [ props.start_time, props.length ])

    function handleDateChange(newDate) {
        console.log("Called handleDateChange(" + newDate.getTime() + ").");

        let newStartTime = newDate.getTime();

        if (props.solve_for_start) {
            // User modified startTime, so determine the new finishTime
            updateState({
                startTime:  newStartTime,
                finishTime: newStartTime + (props.length * 1000)
            });
        } else {
            // User modified finishTime, so determine the new startTime
            newStartTime = newStartTime - (props.length * 1000);

            updateState({
                startTime:  newStartTime,
                finishTime: newDate.getTime()
            });
        }

        // Update state on RecipePage with the new start time
        props.handleUpdateStartTime(newStartTime);
    }

    return (
        <div className="start-finish-container">
            <div className="start-finish-contents">
                <span
                    className="start-finish-toggle-container"
                    title="Toggle solving for start/finish time"
                >
                    <button
                        type="button"
                        className="btn btn-start-finish-toggle"
                        onClick={() => props.handleStartFinishToggle()}
                    >
                        {props.solve_for_start ? "Start at:" : "Finish at:"}
                    </button>
                </span>
                <button onClick={() => console.log(propsData)}>Log</button>

                <span className="start-finish-datepicker">
                    <DatePicker
                        selected={props.solve_for_start ? state.startTime : state.finishTime}
                        onChange={handleDateChange}
                        className="start-finish-datepicker"
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={30}
                        timeCaption="Time"
                        todayButton="Today"
                        useWeekdaysShort={true}
                        dateFormat="MMM dd, yyyy HH:mm"
                    />
                </span>

                <button
                    type="button"
                    name="updateRecipe"
                    className="btn btn-save"
                    onClick={() => props.saveRecipe()}
                > Save
                </button>
            </div>

            <span ref={refSaveText} className="start-finish-save-confirmation animation">
                ✔
            </span>
        </div>
    )
}

RecipeStartFinish.defaultProps = {
    solve_for_start: true,
    start_time:      new Date(0).getTime(),
    length:          0
}
