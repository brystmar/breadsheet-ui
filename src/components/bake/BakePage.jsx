import React, { useState } from "react"
import { Link } from "react-router"
import PageTitle from "../PageTitle"
import useBakeSync from "../../hooks/useBakeSync"
import { recordIcsExport } from "../../data/bakes_api"
import useNow from "../../hooks/useNow"
import useStepNotifications from "../../hooks/useStepNotifications"
import { bakeProgress, formatCountdown, formatLength, timelineMs } from "../../helpers/bake"
import { downloadIcs } from "../../helpers/ics"
import { formatClockInZone, formatInZone, formatStepTimeInZone } from "../../helpers/zoned"
import "../../styles/bake-view.sass"

// In-tab notifications: turn on (asking the browser), turn off, or say why they can't run
function NotificationSwitch({ notifications, running }) {
    const { permission, enabled, turnOn, turnOff } = notifications
    if (permission === "unsupported" || !running) return null

    return (
        <div className="bake-notify">
            {permission === "denied" ?
                <p className="bake-hint">Notifications are blocked for breadsheet in this browser's settings.</p> :
                enabled ? <>
                    <p className="bake-hint">This tab will notify you when each step is due, while it stays open.</p>
                    <button type="button" className="btn-link" onClick={turnOff}>Turn off</button>
                </> : <>
                    <button type="button" className="btn btn-default" onClick={turnOn}>Notify me in this tab</button>
                    <p className="bake-hint">A browser notification when each step is due, while this tab stays open.</p>
                </>}
        </div>
    )
}


function statusLine(bake, progress) {
    const zone = bake.time_zone
    const finish = formatInZone(Date.parse(bake.projected_end), zone)
    if (bake.status === "completed") {
        return `Completed ${formatInZone(Date.parse(bake.completed_at || bake.projected_end), zone)}`
    }
    if (bake.status === "not_started") {
        const start = progress.startMs !== null ? `start at ${formatInZone(progress.startMs, zone)} · ` : ""
        return `Not started · ${start}finish at ${finish}`
    }
    const partway = progress.startedAtStep ? ` · started at step ${progress.startedAtStep}` : ""
    return `In progress · finish at ${finish}${partway}`
}


function endedText(outcome) {
    if (outcome === "canceled") return [ "Canceled", "Steps you hadn't done stay unchecked. Alerts have stopped." ]
    if (outcome === "expired") return [ "Ended", "This bake ended an hour after its last step was due. Alerts have stopped." ]
    return [ "Finished", "Every step is checked off. Alerts have stopped." ]
}


// One step's mark in the timeline
function timelineMark(step, index, bake, progress) {
    if (step.skipped) return [ "Skipped", "skipped" ]
    if (bake.status !== "completed" && index === progress.current) return [ "In progress", "current" ]
    if (step.completed_at) return [ "✓ Done", "done" ]
    if (bake.status === "completed") return [ "Not done", "not-done" ]
    return [ formatLength(step.wait_chosen), "upcoming" ]
}


// The bake view (M2, breadsheet-ui#33): the step in progress, what's next, the timeline, alerts, and
// ending the bake. No edit fields. Taps work offline; see useBakeSync.
// `embedded`: inside Home Assistant's sidebar panel (breadsheet-hass#5), without links that need the site's session
// and without in-tab notifications (Home Assistant sends the alerts)
export default function BakePage({ bake: initialBake, offline = false, embedded = false }) {
    const sync = useBakeSync(initialBake)
    const { bake } = sync
    const notifications = useStepNotifications(bake, { off: embedded })
    const now = useNow()
    const [ confirm, setConfirm ] = useState(null)
    const [ tip, setTip ] = useState(null)
    const [ alertProblem, setAlertProblem ] = useState(null)  // { needsPairing } or { message }
    const [ switchingAlerts, setSwitchingAlerts ] = useState(false)

    // Simple or Fancy can change while the bake runs; Fancy needs a paired Home Assistant (breadsheet-ui#40)
    async function switchAlerts(mode) {
        if (mode === sync.bake.alert_mode || switchingAlerts) return
        setAlertProblem(null)
        setSwitchingAlerts(true)
        const result = await sync.changeAlerts(mode)
        setSwitchingAlerts(false)
        if (!result.ok) {
            setAlertProblem(result.code === "fancy_requires_ha" ? { needsPairing: true } : { message: result.message })
        }
    }

    const zone = bake.time_zone
    const running = bake.status !== "completed"
    const progress = bakeProgress(bake)
    const current = progress.current !== null ? bake.steps[progress.current] : null
    const next = progress.next !== null ? bake.steps[progress.next] : null
    const [ endedTitle, endedBody ] = endedText(bake.outcome)

    function confirmAndRun(action) {
        setConfirm(null)
        action()
    }

    // The step in progress: how long it's run and how long is left
    let elapsed = 0
    let left = 0
    let percent = 0
    if (current) {
        elapsed = (now - Date.parse(current.completed_at)) / 1000
        left = current.wait_chosen - elapsed
        percent = current.wait_chosen > 0 ? Math.min(100, Math.max(0, Math.round(elapsed / current.wait_chosen * 100))) : 100
    }

    const doneLabel = progress.nextIsLast ? "Done, finish bake" : "Done, start next"
    const syncNote = sync.pending && <p className="bake-sync" role="status">Saved, will sync</p>

    return (
        <section className="bake-view">
            <p className="bake-back"><Link to={embedded ? "/panel" : "/"}>← Active bakes</Link></p>
            <PageTitle title={bake.name} includeHr={true} />

            {offline &&
                <p className="bake-offline" role="status">
                    Breadsheet can't be reached right now. This is the last schedule fetched; taps will sync later.
                </p>}
            {bake.recipe_deleted ?
                <p className="bake-meta">This recipe was deleted. The bake keeps running from its copy.</p> :
                <p className="bake-meta">
                    {statusLine(bake, progress)}
                    {bake.recipe_path && !embedded && <> · <Link to={bake.recipe_path}>View recipe</Link></>}
                </p>}
            {bake.recipe_deleted && <p className="bake-meta">{statusLine(bake, progress)}</p>}

            {sync.problem && <p className="bake-problem" role="alert">{sync.problem}</p>}

            <div className="bake-layout">
                <div className="bake-main">
                    {!running &&
                        <div className={`bake-card bake-ended ${bake.outcome || "finished"}`}>
                            <h3>{endedTitle}</h3>
                            <p>{endedBody}</p>
                        </div>}

                    {running && current &&
                        <div className="bake-card bake-current">
                            <p className="bake-eyebrow">In progress · step {current.position} of {bake.steps.length}</p>
                            <h3>{current.text}</h3>
                            {current.note && <p className="bake-note">{current.note}</p>}
                            <div className="bake-progress" role="progressbar" aria-label="Step progress"
                                 aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
                                <span style={{ width: `${percent}%` }} />
                            </div>
                            <p className="bake-times">
                                Started {formatClockInZone(Date.parse(current.completed_at), zone)} · {formatLength(elapsed)} in
                                · {left >= 0 ? `${formatLength(left)} left` : `${formatLength(-left)} over`}
                            </p>
                            {next &&
                                <button type="button" className="btn bake-done" onClick={() => sync.checkOff(next.position)}>
                                    {doneLabel}
                                </button>}
                            {syncNote}
                        </div>}

                    {running && next &&
                        <div className="bake-card bake-next">
                            <div className="bake-next-text">
                                <p className="bake-eyebrow">{current ? "Up next" : "First up"}</p>
                                <h3>{next.text}</h3>
                                <p className="bake-times">
                                    Start at {formatClockInZone(Date.parse(next.scheduled_at), zone)} · lasts {formatLength(next.wait_chosen)}
                                </p>
                                <button type="button" className="btn-link bake-skip-next" onClick={() => sync.skip(next.position)}>
                                    Skip this step
                                </button>
                            </div>
                            <p className="bake-countdown" aria-label={`Starts in ${formatCountdown(Date.parse(next.scheduled_at), now)}`}>
                                {formatCountdown(Date.parse(next.scheduled_at), now)}
                            </p>
                            {!current &&
                                <button type="button" className="btn bake-done" onClick={() => sync.checkOff(next.position)}>
                                    Start now
                                </button>}
                            {!current && syncNote}
                        </div>}

                    <section className="bake-card bake-alerts" aria-labelledby="bake-alerts-heading">
                        <h3 id="bake-alerts-heading">Alerts</h3>
                        <div className="bake-alert-options" role="radiogroup" aria-labelledby="bake-alerts-heading">
                            <div className="bake-alert" tabIndex={0} aria-describedby="tip-simple"
                                 onMouseEnter={() => setTip("simple")} onMouseLeave={() => setTip(null)}
                                 onFocus={() => setTip("simple")} onBlur={() => setTip(null)}
                                 onClick={() => setTip(tip === "simple" ? null : "simple")}>
                                <label>
                                    <input type="radio" name="bake_alert_mode" value="simple"
                                           checked={bake.alert_mode === "simple"} disabled={!running || switchingAlerts}
                                           onChange={() => switchAlerts("simple")} />
                                    Simple
                                </label>
                                <span id="tip-simple" role="tooltip" className={tip === "simple" ? "bake-tip shown" : "bake-tip"}>
                                    Optional ICS calendar alerts
                                </span>
                            </div>
                            <div className="bake-alert fancy" tabIndex={0} aria-describedby="tip-fancy"
                                 onMouseEnter={() => setTip("fancy")} onMouseLeave={() => setTip(null)}
                                 onFocus={() => setTip("fancy")} onBlur={() => setTip(null)}
                                 onClick={() => setTip(tip === "fancy" ? null : "fancy")}>
                                <label>
                                    <input type="radio" name="bake_alert_mode" value="fancy"
                                           checked={bake.alert_mode === "fancy"} disabled={!running || switchingAlerts}
                                           onChange={() => switchAlerts("fancy")} />
                                    <span aria-hidden="true" className="sparkle">✨</span> Fancy
                                </label>
                                <span id="tip-fancy" role="tooltip" className={tip === "fancy" ? "bake-tip shown" : "bake-tip"}>
                                    Lock-screen updates on your phone through Home Assistant
                                </span>
                            </div>
                        </div>
                        {alertProblem?.needsPairing &&
                            <p className="bake-alert-problem" role="status">
                                Fancy alerts need Home Assistant. <Link to="/profile#home-assistant">Pair Home
                                Assistant</Link> on your profile, then switch this bake to Fancy.
                            </p>}
                        {alertProblem?.message && <p className="bake-alert-problem" role="alert">{alertProblem.message}</p>}
                        {!embedded && <NotificationSwitch notifications={notifications} running={running} />}
                        <div className="bake-export">
                            <button type="button" className="btn btn-default" onClick={() => { downloadIcs(bake); recordIcsExport(bake) }}>Export again (.ics)</button>
                            <p className="bake-hint">Calendar events do not update after export.</p>
                        </div>
                    </section>

                    {running && confirm === null &&
                        <div className="bake-end">
                            <button type="button" className="btn bake-cancel" onClick={() => setConfirm("cancel")}>Cancel bake</button>
                            <button type="button" className="btn bake-complete" disabled={sync.pending}
                                    onClick={() => setConfirm("complete")}>Complete</button>
                        </div>}
                    {running && confirm === "complete" &&
                        <div className="bake-card bake-confirm" role="alertdialog" aria-labelledby="confirm-complete">
                            <p id="confirm-complete">
                                {progress.remaining === 1 ? "The step you haven't done will be checked off as done now." :
                                    `The ${progress.remaining} steps you haven't done will be checked off as done now.`} Complete this bake?
                            </p>
                            <div className="bake-end">
                                <button type="button" className="btn btn-default" onClick={() => setConfirm(null)}>Keep baking</button>
                                <button type="button" className="btn bake-complete" onClick={() => confirmAndRun(sync.complete)}>
                                    Complete bake
                                </button>
                            </div>
                        </div>}
                    {running && confirm === "cancel" &&
                        <div className="bake-card bake-confirm" role="alertdialog" aria-labelledby="confirm-cancel">
                            <p id="confirm-cancel">Cancel this bake? Steps you haven't done stay unchecked, and alerts stop.</p>
                            <div className="bake-end">
                                <button type="button" className="btn bake-cancel" onClick={() => confirmAndRun(sync.cancel)}>
                                    Cancel bake
                                </button>
                                <button type="button" className="btn btn-default" onClick={() => setConfirm(null)}>Keep baking</button>
                            </div>
                        </div>}
                </div>

                <section className="bake-timeline-section" aria-labelledby="bake-timeline-heading">
                    <h3 id="bake-timeline-heading">Timeline</h3>
                    <ol className="bake-timeline" aria-label="Timeline steps">
                        {bake.steps.map((step, index) => {
                            const [ mark, kind ] = timelineMark(step, index, bake, progress)
                            const time = timelineMs(step, progress.startMs)
                            const canSkip = running && kind === "upcoming" && index !== progress.current
                            return (
                                <li key={step.position} className={`bake-step ${kind}`}>
                                    <span className="bake-step-time">{time !== null ? formatStepTimeInZone(time, zone) : ""}</span>
                                    <span className="bake-step-text">
                                        {step.position}. {step.text}
                                        {step.note && (kind === "upcoming" || kind === "current") &&
                                            <span className="bake-step-note">{step.note}</span>}
                                    </span>
                                    <span className="bake-step-mark">{mark}</span>
                                    {canSkip &&
                                        <button type="button" className="btn btn-default bake-step-skip"
                                                aria-label={`Skip step ${step.position}, ${step.text}`}
                                                onClick={() => sync.skip(step.position)}>Skip</button>}
                                </li>
                            )
                        })}
                    </ol>
                </section>
            </div>
        </section>
    )
}
