import React, { useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import DatePicker from "react-datepicker"
import PageTitle from "../PageTitle"
import useSession from "../../hooks/useSession"
import { newIdempotencyKey, recordIcsExport, startBake } from "../../data/bakes_api"
import { effectiveWait, nextQuarterHour, planStep, stepTimes } from "../../helpers/plan"
import { downloadIcs } from "../../helpers/ics"
import { browserTimeZone, formatInZone, instantToWallDate, timeZoneOptions, wallTimeToInstant } from "../../helpers/zoned"
import "../../styles/start-bake.sass"


// The plan's waits for each step, by position: what the plan view handed over, else the recipe's defaults
function bakeSteps(recipe, planWaits) {
    return (recipe.steps || []).map((step, index) => {
        const planned = planStep(step)
        const wait = planWaits?.[index] ?? effectiveWait(planned)
        return { ...planned, position: step.position ?? index + 1, defaultWait: step.default_wait, wait }
    })
}


// "Steps 1–3 will be marked skipped." for starting partway through
function skippedNote(steps, startIndex) {
    if (startIndex <= 0) return null
    const first = steps[0].position
    const last = steps[startIndex - 1].position
    const which = startIndex === 1 ? `Step ${first} will be` : `Steps ${first}–${last} will be`
    return `${which} marked skipped, and the bake begins at step ${steps[startIndex].position}.`
}


// The Start bake screen (M2, breadsheet-ui#32): confirm when and where, optionally begin partway
// through, choose alerts, then start. Opens from the plan view, which hands over its anchor and waits.
export default function StartBakePage({ recipe }) {
    const navigate = useNavigate()
    const location = useLocation()
    const { status: sessionStatus } = useSession()
    const planned = location.state || {}

    const ownZone = useRef(browserTimeZone()).current
    const zones = useRef(timeZoneOptions(ownZone)).current
    const [ steps ] = useState(() => bakeSteps(recipe, planned.waits))

    const [ solveForStart, setSolveForStart ] = useState(planned.solveForStart ?? true)
    const [ zone, setZone ] = useState(ownZone)
    const [ wall, setWall ] = useState(() => instantToWallDate(planned.anchor ?? nextQuarterHour(), ownZone))
    const [ startIndex, setStartIndex ] = useState(0)
    const [ exportIcs, setExportIcs ] = useState(true)
    const [ showFancyTip, setShowFancyTip ] = useState(false)
    const [ submitting, setSubmitting ] = useState(false)
    const [ error, setError ] = useState(null)

    // One key per set of choices: a retry of the same choices can't start a second bake,
    // and changing anything afterwards starts a new attempt
    const idempotencyKey = useRef(newIdempotencyKey())
    function changed(setter) {
        return (value) => {
            idempotencyKey.current = newIdempotencyKey()
            setError(null)
            setter(value)
        }
    }

    const anchor = wallTimeToInstant(wall, zone)
    const remaining = steps.slice(startIndex).map((step) => ({ ...step, thenWait: step.wait }))
    const { start, finish } = stepTimes(remaining, anchor, solveForStart)

    const signedIn = sessionStatus === "signedIn"
    const signInState = { from: location.pathname }
    const canStart = signedIn && !recipe.is_draft && steps.length > 0 && !submitting

    // Switching between Start at and Finish at keeps the schedule where it is
    const pickAnchor = changed((toStart) => {
        if (toStart === solveForStart) return
        setWall(instantToWallDate(toStart ? start : finish, zone))
        setSolveForStart(toStart)
    })

    async function handleStart(event) {
        event.preventDefault()
        if (!canStart) return

        const waits = steps
            .filter((step) => step.defaultWait !== undefined && step.wait !== step.defaultWait)
            .map((step) => ({ position: step.position, wait_chosen: step.wait }))
        const body = {
            recipe_id:     recipe.id,
            anchor_type:   solveForStart ? "start" : "finish",
            anchor_time:   new Date(anchor).toISOString(),
            time_zone:     zone,
            alert_mode:    "simple",
            start_at_step: steps[startIndex].position,
            ...(waits.length ? { waits } : {})
        }

        setSubmitting(true)
        setError(null)
        const result = await startBake(body, idempotencyKey.current)
        setSubmitting(false)

        if (!result.ok) {
            setError(result.message)
            return
        }
        const { bake } = result.data
        if (exportIcs) {
            downloadIcs(bake)
            recordIcsExport(bake)
        }
        navigate(bake.path)
    }

    const prerequisites = recipe.prerequisites || []

    return (
        <form className="start-bake" onSubmit={handleStart}>
            <p className="start-bake-back"><Link to={recipe.path}>← Back to the plan</Link></p>
            <PageTitle title="Start bake" includeHr={true} />
            <p className="start-bake-recipe">{recipe.name}</p>

            {prerequisites.length > 0 &&
                <section className="start-bake-card start-bake-prereqs" aria-labelledby="start-bake-prereqs">
                    <h3 id="start-bake-prereqs">Before you start</h3>
                    <p>{prerequisites.length === 1 ? "You'll need this ready when the bake starts:" :
                        "You'll need one of these ready when the bake starts:"}</p>
                    <ul>
                        {prerequisites.map((prereq) =>
                            <li key={prereq.id}><Link to={prereq.path}>{prereq.name}</Link></li>)}
                    </ul>
                </section>}

            <section className="start-bake-card" aria-labelledby="start-bake-when">
                <h3 id="start-bake-when">When</h3>
                <div className="start-bake-anchor" role="group" aria-label="Anchor the bake to">
                    <button type="button" aria-pressed={solveForStart} onClick={() => pickAnchor(true)}>Start at</button>
                    <button type="button" aria-pressed={!solveForStart} onClick={() => pickAnchor(false)}>Finish at</button>
                </div>

                <label className="start-bake-label" id="start-bake-time-label">
                    {solveForStart ? "Start time" : "Finish time"}
                </label>
                <DatePicker selected={wall}
                            onChange={(date) => date && changed(setWall)(date)}
                            className="start-bake-input"
                            ariaLabelledBy="start-bake-time-label"
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            timeCaption="Time"
                            todayButton="Today"
                            dateFormat="MMM d, yyyy HH:mm" />

                <label className="start-bake-label" htmlFor="start-bake-zone">Time zone</label>
                <select id="start-bake-zone" className="start-bake-input" value={zone}
                        onChange={(event) => changed(setZone)(event.target.value)}>
                    {zones.map((option) =>
                        <option key={option} value={option}>{option === ownZone ? `${option} (this browser)` : option}</option>)}
                </select>

                <p className="start-bake-summary" aria-live="polite">
                    Start at {formatInZone(start, zone)} · Finish at {formatInZone(finish, zone)}
                </p>
            </section>

            {steps.length > 1 &&
                <section className="start-bake-card" aria-labelledby="start-bake-partway">
                    <h3 id="start-bake-partway">Already started?</h3>
                    <label className="start-bake-label" htmlFor="start-bake-step">Begin at step</label>
                    <select id="start-bake-step" className="start-bake-input" value={startIndex}
                            onChange={(event) => changed(setStartIndex)(Number(event.target.value))}>
                        {steps.map((step, index) =>
                            <option key={step.position} value={index}>
                                {step.position}. {step.text}{index === 0 ? " (from the beginning)" : ""}
                            </option>)}
                    </select>
                    {startIndex > 0 && <p className="start-bake-hint">{skippedNote(steps, startIndex)}</p>}
                </section>}

            <section className="start-bake-card" aria-labelledby="start-bake-alerts">
                <h3 id="start-bake-alerts">Alerts</h3>
                <div className="start-bake-alerts" role="radiogroup" aria-labelledby="start-bake-alerts">
                    <div className="alert-option alert-simple">
                        <label className="alert-choice">
                            <input type="radio" name="alert_mode" value="simple" checked readOnly />
                            <span className="alert-title">Simple</span>
                        </label>
                        <label className="alert-ics">
                            <input type="checkbox" checked={exportIcs}
                                   onChange={(event) => setExportIcs(event.target.checked)} />
                            Export calendar events as ICS
                        </label>
                    </div>

                    {/* Fancy needs Home Assistant (M3); until then it's shown but can't be picked */}
                    <div className="alert-option alert-fancy"
                         tabIndex={0}
                         aria-describedby="fancy-tip"
                         onClick={() => setShowFancyTip(!showFancyTip)}
                         onBlur={() => setShowFancyTip(false)}>
                        <label className="alert-choice">
                            <input type="radio" name="alert_mode" value="fancy" disabled />
                            <span className="alert-title"><span aria-hidden="true">✨ </span>Fancy</span>
                        </label>
                        <span className="alert-desc">Phone alerts through Home Assistant</span>
                        <span id="fancy-tip" role="tooltip" className={showFancyTip ? "alert-tip shown" : "alert-tip"}>
                            Coming soon!
                        </span>
                    </div>
                </div>
            </section>

            {!signedIn && sessionStatus !== "loading" &&
                <p className="start-bake-signin">
                    To start a bake, <Link to="/signin" state={signInState}>sign in</Link> or <Link to="/register">register</Link>.
                </p>}
            {recipe.is_draft && <p className="start-bake-hint">Drafts can't be baked. Save it as a finished recipe first.</p>}
            {error && <p className="start-bake-error" role="alert">{error}</p>}

            <button type="submit" className="btn btn-primary start-bake-submit" disabled={!canStart}>
                {submitting ? "Starting…" : "Start bake"}
            </button>
            {exportIcs &&
                <p className="start-bake-hint">
                    Downloads the schedule as calendar events. Calendar events do not update after export.
                </p>}
        </form>
    )
}
