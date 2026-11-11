import React, { useState } from "react"
import TxtHhmm from "../plan/TxtHhmm"
import { formatHhmm } from "../../helpers/hhmm"
import { effectiveWait, isOutOfRange } from "../../helpers/plan"
import { WARNING_TEXT, withThenWait } from "../../helpers/recipe_form"


function FieldError({ id, message }) {
    return message ? <span id={id} className="edit-field-error">{message}</span> : null
}


// One step in the recipe editor. Simple shows the directions, note, and Then Wait; Detailed adds the
// range, hands-on minutes, and whether you need to be home. Clicking the step's header row collapses
// everything under it into that row, so long recipes stay short; a step with an error always shows.
export default function EditStepRow({ step, index, count, detailed, errors, onChange, onMove, onRemove }) {
    const [ collapsed, setCollapsed ] = useState(false)
    const n = index + 1
    const error = (field) => errors[`steps[${index}].${field}`]
    const textError = error("text")
    const rangeError = error("wait_max") || error("wait_min")
    const handsOnError = error("active_seconds")
    const id = `step-${step.key}`
    const hasError = Object.keys(errors).some((key) => key.startsWith(`steps[${index}].`))
    const open = !collapsed || hasError

    return (
        <li className={open ? "edit-step" : "edit-step collapsed"}>
            <div className="edit-step-head">
                <button type="button" className="edit-step-toggle" aria-expanded={open} aria-controls={`${id}-body`}
                        onClick={() => setCollapsed(open)}>
                    <span className="edit-step-chevron" aria-hidden="true">{open ? "▾" : "▸"}</span>
                    <span className="edit-step-number">Step {n}</span>
                    {!open &&
                        <span className="edit-step-summary">
                            {step.text.trim() || "No directions yet"} · {formatHhmm(effectiveWait(step))}
                        </span>}
                </button>
                <span className="edit-step-tools">
                    <button type="button" className="btn btn-default" aria-label={`Move step ${n} up`}
                            disabled={index === 0} onClick={() => onMove(-1)}>↑</button>
                    <button type="button" className="btn btn-default" aria-label={`Move step ${n} down`}
                            disabled={index === count - 1} onClick={() => onMove(1)}>↓</button>
                    <button type="button" className="btn btn-default" aria-label={`Remove step ${n}`}
                            onClick={onRemove}>Remove</button>
                </span>
            </div>

            <div id={`${id}-body`} hidden={!open}>
                <label className="edit-label" htmlFor={`${id}-text`}>Directions</label>
                <input id={`${id}-text`} className={textError ? "edit-input invalid" : "edit-input"} type="text"
                       value={step.text} aria-invalid={Boolean(textError)} aria-describedby={textError ? `${id}-text-error` : undefined}
                       onChange={(event) => onChange({ text: event.target.value })} />
                <FieldError id={`${id}-text-error`} message={textError} />

                <label className="edit-label" htmlFor={`${id}-note`}>Note <span className="edit-optional">(optional)</span></label>
                <textarea id={`${id}-note`} className="edit-input" rows={2} value={step.note}
                          onChange={(event) => onChange({ note: event.target.value })} />

                <div className="edit-step-waits">
                    <span className="edit-wait">
                        <span className="edit-label">Then Wait</span>
                        <TxtHhmm value={effectiveWait(step)} label={`step ${n} Then Wait`} steppers={true}
                                 outOfRange={isOutOfRange(step)}
                                 onCommit={(seconds) => onChange(detailed ? { thenWait: seconds } : withThenWait(step, seconds))} />
                    </span>

                    {detailed && <>
                        <span className="edit-wait">
                            <span className="edit-label">Range</span>
                            <span className="plan-range-inputs">
                                <TxtHhmm value={step.min} label={`step ${n} shortest wait`} onCommit={(seconds) => onChange({ min: seconds })} />
                                <span aria-hidden="true">–</span>
                                <TxtHhmm value={step.max} label={`step ${n} longest wait`} onCommit={(seconds) => onChange({ max: seconds })} />
                            </span>
                            <FieldError id={`${id}-range-error`} message={rangeError} />
                        </span>

                        <span className="edit-wait">
                            <label className="edit-label" htmlFor={`${id}-handson`}>Hands-on (min)</label>
                            <input id={`${id}-handson`} className={handsOnError ? "edit-input edit-minutes invalid" : "edit-input edit-minutes"}
                                   type="text" inputMode="numeric" placeholder="Unknown" value={step.handsOn}
                                   aria-invalid={Boolean(handsOnError)}
                                   onChange={(event) => onChange({ handsOn: event.target.value })} />
                            <FieldError id={`${id}-handson-error`} message={handsOnError} />
                        </span>

                        <span className="edit-wait">
                            <label className="edit-label" htmlFor={`${id}-presence`}>Needs you home</label>
                            <select id={`${id}-presence`} className="edit-input edit-presence"
                                    value={step.needsPresence === null ? "" : String(step.needsPresence)}
                                    onChange={(event) => onChange({ needsPresence: event.target.value === "" ? null : event.target.value === "true" })}>
                                <option value="">Unknown</option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </span>
                    </>}
                </div>

                {step.warnings.length > 0 &&
                    <ul className="edit-step-warnings">
                        {step.warnings.map((warning) => <li key={warning}>{WARNING_TEXT[warning] || warning}</li>)}
                    </ul>}
            </div>
        </li>
    )
}
