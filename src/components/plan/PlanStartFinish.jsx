import React from "react"
import DatePicker from "react-datepicker"
import { formatPlanDate } from "../../helpers/plan"


// The Start at / Finish at row: the toggle and the time it anchors, with the bake's other end beneath.
// Toggling keeps the schedule where it is; the box just switches to the other end.
export default function PlanStartFinish({ solveForStart, start, finish, onToggle, onAnchorChange, children }) {
    const anchor = solveForStart ? start : finish
    const other = solveForStart ? finish : start

    return (
        <div className="plan-start-finish">
            <button type="button" className="btn btn-default plan-anchor-toggle" onClick={onToggle}>
                {solveForStart ? "Start at:" : "Finish at:"}
            </button>

            <DatePicker selected={new Date(anchor)}
                        onChange={(date) => date && onAnchorChange(date.getTime())}
                        className="plan-anchor-input"
                        ariaLabelledBy="plan-anchor-label"
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        timeCaption="Time"
                        todayButton="Today"
                        dateFormat="MMM d, yyyy HH:mm" />

            {/* Room for the Start bake button (breadsheet-ui#32, part 2) */}
            <span className="plan-start-finish-action">{children}</span>

            <span className="plan-other-label">{solveForStart ? "Finish at:" : "Start at:"}</span>
            <span className="plan-other-time">{formatPlanDate(other)}</span>
            <span id="plan-anchor-label" className="sr-only">{solveForStart ? "Start at" : "Finish at"}</span>
        </div>
    )
}
