import React, { useState, useRef } from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import "../styles/start-finish.sass";


export default function RecipeStartFinish(props) {
    const [ state, updateState ] = useState({
        startTime:  moment(props.start_time).valueOf(),
        finishTime: moment(props.start_time).add(props.length, 'seconds').valueOf()
    });

    const refSaveText = useRef(null);

    function handleDateChange(newDate) {
        // console.log("Called handleDateChange(" + newDate.getTime() + ").");
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
                        {props.solveForStart ? "Start at:" : "Finish at:"}
                    </button>
                </span>

                <span className="start-finish-datepicker">
                        <DatePicker
                            selected={props.solveForStart ? state.startTime : state.finishTime}
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
    start_time: new Date(0).getTime(),
    solve_for_start: true,
    length: 0
}
