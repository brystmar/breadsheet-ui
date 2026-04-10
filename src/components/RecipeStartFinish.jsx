import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import "../styles/start-finish.sass";


export default function RecipeStartFinish({ solve_for_start = true, start_time = new Date(0).getTime(), length = 0, handleUpdateStartTime, handleStartFinishToggle, saveRecipe }) {
    // const propsData = `/PROPS/ s4s: ${solve_for_start}, len: ${length}, s_time: ${start_time}`;
    // console.log(propsData);

    function convertToFinish(startTime) {
        if (typeof (startTime) !== typeof (new Date(0).getTime())) {
            console.error(`cTF: Incorrect data type provided -- ${typeof (startTime)}.`)
            return startTime
        }

        return moment(startTime).add(length, 'seconds').valueOf();
    }

    // TODO: Need to simplify by completely removing finishTime from this component.
    //  Only thing that should be in local state is startTime.
    const [ state, updateState ] = useState({
        startTime:  moment(start_time).valueOf(),
        finishTime: convertToFinish(start_time)
    });

    const refSaveText = useRef(null);

    useEffect(() => {
        updateState({
            startTime:  moment(start_time).valueOf(),
            finishTime: convertToFinish(start_time)
        })
    }, [ start_time, length ])

    function handleDateChange(newDate) {
        // Easier to understand as its own function
        let newStartTime = newDate.getTime();

        if (solve_for_start) {
            // User modified startTime, so determine the new finishTime
            updateState({
                startTime:  newStartTime,
                finishTime: newStartTime + (length * 1000)
            });
        } else {
            // User modified finishTime, so determine the new startTime
            updateState({
                startTime:  newStartTime - (length * 1000),
                finishTime: newDate.getTime()
            });
        }

        // Update state on RecipePage with the new start time
        handleUpdateStartTime(newStartTime);
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
                        onClick={() => handleStartFinishToggle()}
                    >
                        {solve_for_start ? "Start at:" : "Finish at:"}
                    </button>
                </span>

                <span className="start-finish-datepicker">
                    <DatePicker
                        selected={solve_for_start ? state.startTime : state.finishTime}
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
                    onClick={() => saveRecipe()}
                > Save
                </button>
            </div>

            <span ref={refSaveText} className="start-finish-save-confirmation animation">
                ✔
            </span>
        </div>
    )
}


