import React from "react"
import TxtHhmm from "./TxtHhmm"
import { effectiveWait, formatStepTime, isOutOfRange } from "../../helpers/plan"
import { formatHhmm } from "../../helpers/hhmm"


// One row of the plan's schedule. Phones show the range as a caption under Then Wait; wider screens
// give it its own column. A Then Wait outside its range is marked by color and a tooltip only.
export default function PlanStepRow({ step, number, when, editable, highlight, onChange }) {
    const outOfRange = isOutOfRange(step)
    const hasRange = step.min !== step.max
    const label = `step ${number}`

    return (
        <div role="row" className={highlight ? "plan-step-row list-row-highlighted" : "plan-step-row"}>
            <span role="cell" className="plan-col-step">{number}.</span>
            <span role="cell" className="plan-col-when">{formatStepTime(when)}</span>
            <span role="cell" className="plan-col-action">{step.text}</span>

            <span role="cell" className="plan-col-wait">
                <TxtHhmm value={effectiveWait(step)}
                         label={`${label} Then Wait`}
                         disabled={!editable}
                         outOfRange={outOfRange}
                         steppers={true}
                         onCommit={(seconds) => onChange({ thenWait: seconds })} />
                {hasRange &&
                    <span className="plan-range-caption">{formatHhmm(step.min)}–{formatHhmm(step.max)}</span>}
            </span>

            <span role="cell" className="plan-col-range">
                <span className="plan-range-inputs">
                    <TxtHhmm value={step.min}
                             label={`${label} shortest wait`}
                             disabled={!editable}
                             onCommit={(seconds) => onChange({ min: seconds })} />
                    <span aria-hidden="true">–</span>
                    <TxtHhmm value={step.max}
                             label={`${label} longest wait`}
                             disabled={!editable}
                             onCommit={(seconds) => onChange({ max: seconds })} />
                </span>
                {step.min > step.max && <span className="plan-range-error">Min is longer than max</span>}
            </span>

            <span role="cell" className="plan-col-note">{step.note}</span>
        </div>
    )
}
