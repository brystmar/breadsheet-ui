import React, { useState } from "react"
import { formatHhmm, nudgeSeconds, parseHhmm } from "../../helpers/hhmm"


// One "hh:mm" wait. Typing is free-form; the value is read and tidied when the box loses focus or on
// Enter (01:68 becomes 02:08), and anything unreadable goes back to the last value. The up and down arrow
// keys change it by a minute. `steppers` adds small up and down buttons, shown on desktop widths only.
export default function TxtHhmm({ value = 0, onCommit, label, disabled = false, outOfRange = false, steppers = false }) {
    const [ draft, setDraft ] = useState(null)

    // Saves what's typed, if it reads as a time
    function commit() {
        if (draft === null) return
        const seconds = parseHhmm(draft)
        setDraft(null)
        if (seconds !== null && seconds !== value) onCommit(seconds)
    }

    // One minute up or down, starting from what's typed when it reads as a time
    function nudge(minutes) {
        const typed = draft === null ? null : parseHhmm(draft)
        setDraft(null)
        onCommit(nudgeSeconds(typed ?? value, minutes))
    }

    // The buttons don't take focus, so a half-typed value is nudged instead of saved first
    function keepFocus(event) {
        event.preventDefault()
    }

    function handleKeyDown(event) {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault()
            nudge(event.key === "ArrowUp" ? 1 : -1)
        } else if (event.key === "Enter") {
            commit()
        }
    }

    return (
        <span className={outOfRange ? "hhmm-wrap out" : "hhmm-wrap"}>
            <input type="text"
                   inputMode="numeric"
                   className="hhmm"
                   aria-label={outOfRange ? `${label}, outside range` : label}
                   placeholder="hh:mm"
                   value={draft ?? formatHhmm(value)}
                   disabled={disabled}
                   onChange={(event) => setDraft(event.target.value)}
                   onKeyDown={handleKeyDown}
                   onBlur={commit} />

            {steppers &&
                <span className="hhmm-steppers">
                    <button type="button" aria-label={`Add a minute to ${label}`} disabled={disabled} onMouseDown={keepFocus} onClick={() => nudge(1)}>
                        <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 5l4-4 4 4" /></svg>
                    </button>
                    <button type="button" aria-label={`Take a minute off ${label}`} disabled={disabled} onMouseDown={keepFocus} onClick={() => nudge(-1)}>
                        <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" /></svg>
                    </button>
                </span>}

            {outOfRange && <span className="hhmm-tip" role="tooltip">Outside range</span>}
        </span>
    )
}
