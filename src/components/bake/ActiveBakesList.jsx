import React from "react"
import { Link } from "react-router"
import useActiveBakes from "../../hooks/useActiveBakes"
import useNow from "../../hooks/useNow"
import { bakeProgress, formatLength } from "../../helpers/bake"
import { formatClockInZone, formatInZone } from "../../helpers/zoned"
import "../../styles/active-bakes.sass"

const ACTIVE_BAKE_LIMIT = 3


// One line on where a bake stands
function stepLine(bake, now) {
    const progress = bakeProgress(bake)
    const zone = bake.time_zone
    if (progress.current !== null) {
        const current = bake.steps[progress.current]
        const left = current.wait_chosen - (now - Date.parse(current.completed_at)) / 1000
        return `In progress: ${current.text} · ${left >= 0 ? `${formatLength(left)} left` : `${formatLength(-left)} over`}`
    }
    if (progress.next === null) return ""
    const next = bake.steps[progress.next]
    const at = Date.parse(next.scheduled_at)
    return bake.status === "not_started" ? `Start at ${formatInZone(at, zone)}` :
        `Up next: ${next.text} · at ${formatClockInZone(at, zone)}`
}


// Active bakes above the recipe list on the home page (M2, breadsheet-ui#33), each opening its bake view
export default function ActiveBakesList() {
    const { bakes } = useActiveBakes()
    const now = useNow()
    if (bakes.length === 0) return null

    return (
        <section className="active-bakes" aria-labelledby="active-bakes-heading">
            <h2 id="active-bakes-heading">Active bakes</h2>
            <ul>
                {bakes.map((bake) =>
                    <li key={bake.id}>
                        <Link to={bake.path} className="active-bake-card">
                            <span className="active-bake-name">{bake.name}</span>
                            <span className={`active-bake-status ${bake.status}`}>
                                {bake.status === "not_started" ? "Not started" : "In progress"}
                            </span>
                            <span className="active-bake-step">{stepLine(bake, now)}</span>
                            <span className="active-bake-ends">
                                Finish at {formatInZone(Date.parse(bake.projected_end), bake.time_zone)}
                            </span>
                        </Link>
                    </li>)}
            </ul>
            {bakes.length >= ACTIVE_BAKE_LIMIT &&
                <p className="active-bakes-limit">
                    That's three bakes, the most you can run at once. Complete or cancel one to start another.
                </p>}
        </section>
    )
}
