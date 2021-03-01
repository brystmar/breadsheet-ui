import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import "../styles/start-finish.sass";


export default function RecipeStartFinish(props) {
    console.log("RSF props:", props)

    // TODO: Shit's broken.  Need to simplify by completely removing startTime from this component.
    //  Only thing that should be in local state is finishTime.
    const [ state, updateState ] = useState({
        startTime:  moment(props.start_time).valueOf(),
        finishTime: moment(props.start_time).add(props.length, 'seconds').valueOf()
    });

    const [ date, updateDate ] = useState(new Date());
    const refSaveText = useRef(null);

    useEffect(() => {
        updateState({
            startTime:  moment(props.start_time).valueOf(),
            finishTime: moment(props.start_time).add(props.length, 'seconds').valueOf()
        })
    }, [ props.start_time, props.length ])

    function handleDateChange(event, newDate) {
        console.log("Called handleDateChange(" + newDate.getTime() + ").");
        console.log(`Called hDC w/value: ${event.target.value}`);

        let newStartTime;

        if (props.solve_for_start) {
            // User modified startTime, so determine the new finishTime
            let newStartTime = newDate.getTime();

            updateState({
                startTime:  newStartTime,
                finishTime: newStartTime + (props.length * 1000)
            });
        } else {
            // User modified finishTime, so determine the new startTime
            newStartTime = newDate.getTime() - (props.length * 1000);

            updateState({
                startTime:  newStartTime,
                finishTime: newDate.getTime()
            });
        }

        // Update state on RecipePage with the new start time
        // console.log("updating start time on parent to", newStartTime)
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
                <button
                    onClick={() => console.log(`SFStart? ${props.solve_for_start}, start_time: ${props.start_time}\n startTime: ${state.startTime}, finishTime: ${state.finishTime}`)}
                >
                    Log
                </button>

                <span className="start-finish-datepicker">
                    <DatePicker
                        selected={props.solve_for_start ? state.startTime : state.finishTime}
                        onChange={(event) => handleDateChange(event)}
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
                >
                    Save
                </button>
            </div>

            <span ref={refSaveText} className="start-finish-save-confirmation animation">
                ✔
            </span>
        </div>
    )
}

RecipeStartFinish.defaultProps = {
    start_time:      new Date(0).getTime(),
    solve_for_start: true,
    length:          0
}
