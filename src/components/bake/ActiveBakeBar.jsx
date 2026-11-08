import React from "react"
import { Link, useLocation } from "react-router"
import useActiveBakes from "../../hooks/useActiveBakes"
import useBakeSync from "../../hooks/useBakeSync"
import useNow from "../../hooks/useNow"
import { bakeProgress, formatLength } from "../../helpers/bake"
import { formatStepTimeInZone } from "../../helpers/zoned"
import "../../styles/active-bakes.sass"


// Which bake the bar shows: one with a step in progress before one that hasn't begun, then the one whose
// next step is due soonest
function urgency(bake) {
    const { current, next } = bakeProgress(bake)
    const at = next !== null ? Date.parse(bake.steps[next].scheduled_at) : NaN
    return [ current === null ? 1 : 0, Number.isNaN(at) ? Infinity : at ]
}

function byUrgency(a, b) {
    const [ x, y ] = [ urgency(a), urgency(b) ]
    return x[0] - y[0] || (x[1] === y[1] ? 0 : x[1] - y[1])
}


// The active bake bar (M2, breadsheet-ui#33): under the header on every page but the bake view, so it
// follows the baker around. With several bakes going, it shows the most pressing one.
export default function ActiveBakeBar() {
    const { bakes, refresh } = useActiveBakes()
    const { pathname } = useLocation()
    if (bakes.length === 0 || pathname.startsWith("/bakes/")) return null

    const bake = [ ...bakes ].sort(byUrgency)[0]
    return <BarFor key={bake.id} initialBake={bake} others={bakes.length - 1} onSynced={refresh} />
}


function BarFor({ initialBake, others, onSynced }) {
    const sync = useBakeSync(initialBake, { onSynced })
    const now = useNow()
    const { bake } = sync
    if (bake.status === "completed") return null

    const zone = bake.time_zone
    const progress = bakeProgress(bake)
    const current = progress.current !== null ? bake.steps[progress.current] : null
    const next = progress.next !== null ? bake.steps[progress.next] : null

    let summary
    if (current) {
        const elapsed = (now - Date.parse(current.completed_at)) / 1000
        const left = current.wait_chosen - elapsed
        const percent = current.wait_chosen > 0 ? Math.min(100, Math.max(0, Math.round(elapsed / current.wait_chosen * 100))) : 100
        summary = <>
            <span className="bar-step">Step {current.position} of {bake.steps.length}: {current.text}</span>
            <span className="bar-progress-row">
                <span className="bar-progress" role="progressbar" aria-label="Progress in this step"
                      aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
                    <span style={{ width: `${percent}%` }} />
                </span>
                <span className="bar-times">
                    {formatLength(elapsed)} in · {left >= 0 ? `${formatLength(left)} left` : `${formatLength(-left)} over`}
                </span>
            </span>
            <span className="bar-next">
                {next ? `Next: ${next.text} · ${formatLength(next.wait_chosen)}` : "This is the last step."}
            </span>
        </>
    } else if (next) {
        summary = <>
            <span className="bar-step">Start at {formatStepTimeInZone(Date.parse(next.scheduled_at), zone)}</span>
            <span className="bar-next">First up: {next.text} · {formatLength(next.wait_chosen)}</span>
        </>
    }

    return (
        <section className="active-bake-bar" aria-label="Active bake">
            <div className="bar-inner">
                <Link to={bake.path} className="bar-link">
                    <span className="bar-eyebrow">Baking · {bake.name}</span>
                    {summary}
                </Link>
                <div className="bar-actions">
                    {current && next &&
                        <button type="button" className="bar-done" onClick={() => sync.checkOff(next.position)}>
                            {progress.nextIsLast ? "Done, finish bake" : "Done, start next"}
                        </button>}
                    {sync.pending && <span className="bar-sync" role="status">Saved, will sync</span>}
                    {others > 0 && <Link to="/" className="bar-more">+{others} more</Link>}
                </div>
            </div>
            {sync.problem && <p className="bar-problem" role="alert">{sync.problem}</p>}
        </section>
    )
}
