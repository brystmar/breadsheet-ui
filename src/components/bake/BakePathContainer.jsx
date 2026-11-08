import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import PageTitle from "../PageTitle"
import useSession from "../../hooks/useSession"
import { bakeBySuffix } from "../../data/bakes_api"
import { downloadIcs } from "../../helpers/ics"
import { formatInZone, formatStepTimeInZone } from "../../helpers/zoned"
import "../../styles/start-bake.sass"


// A step's place in the timeline: done, skipped, or when it's due
function stepStatus(step, zone) {
    if (step.completed_at) return `Done ${formatStepTimeInZone(Date.parse(step.completed_at), zone)}`
    if (step.skipped) return "Skipped"
    return formatStepTimeInZone(Date.parse(step.scheduled_at), zone)
}


// /bakes/<suffix> (M2): the bake's schedule, for now. The full bake view, with check-offs and skips,
// arrives with breadsheet-ui#33.
export default function BakePathContainer() {
    const { suffix } = useParams()
    const { status: sessionStatus } = useSession()
    const [ result, setResult ] = useState({ suffix: null })

    useEffect(() => {
        if (sessionStatus !== "signedIn") return
        let current = true
        bakeBySuffix(suffix).then((response) => {
            if (current) setResult({ suffix, response })
        })
        return () => { current = false }
    }, [ suffix, sessionStatus ])

    if (sessionStatus === "signedOut") {
        return (
            <section className="bake-page">
                <PageTitle title="Bake" includeHr={true} />
                <p>Bakes are private. <Link to="/signin" state={{ from: `/bakes/${suffix}` }}>Sign in</Link> to see yours.</p>
            </section>
        )
    }
    if (result.suffix !== suffix) return <PageTitle title="" includeHr={true} />

    const { response } = result
    if (!response.ok) {
        return (
            <section className="bake-page">
                <PageTitle title={response.status === 404 ? "Bake not found" : "Something went wrong"} includeHr={true} />
                <p>{response.message}</p>
                <p><Link to="/">See all recipes</Link></p>
            </section>
        )
    }

    const { bake } = response.data
    const zone = bake.time_zone
    const scheduled = bake.steps.filter((step) => step.scheduled_at)
    const start = scheduled.length ? Date.parse(scheduled[0].scheduled_at) : null

    return (
        <section className="bake-page">
            <PageTitle title={bake.name} includeHr={true} />
            {bake.recipe_path ? <p className="start-bake-back"><Link to={bake.recipe_path}>See the recipe</Link></p> :
                bake.recipe_deleted && <p className="start-bake-hint">This recipe was deleted.</p>}

            <p className="start-bake-summary">
                {start !== null && <>Start at {formatInZone(start, zone)} · </>}
                Finish at {formatInZone(Date.parse(bake.projected_end), zone)}
                <span className="bake-zone"> ({zone})</span>
            </p>

            <ol className="bake-timeline" aria-label="Timeline">
                {bake.steps.map((step) =>
                    <li key={step.position} className={step.skipped ? "skipped" : step.completed_at ? "done" : ""}>
                        <span className="bake-timeline-time">{stepStatus(step, zone)}</span>
                        <span className="bake-timeline-text">{step.position}. {step.text}</span>
                    </li>)}
            </ol>

            <div className="bake-export">
                <button type="button" className="btn btn-default" onClick={() => downloadIcs(bake)}>Export again</button>
                <p className="start-bake-hint">Calendar events do not update after export.</p>
            </div>
            <p className="start-bake-hint">Checking off and skipping steps here is coming soon.</p>
        </section>
    )
}
