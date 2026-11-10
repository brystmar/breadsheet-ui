import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import BakePage from "./BakePage"
import { getBake, listActiveBakes } from "../../data/bakes_api"
import { takePanelTokenFromUrl } from "../../data/panel_token"
import { cachedBakeById, rememberBake } from "../../hooks/useBakeSync"
import { formatStepTimeInZone } from "../../helpers/zoned"
import "../../styles/bake-view.sass"


const REOPEN = "Open Breadsheet again from Home Assistant's sidebar."

// Network trouble and outages fall back to the last copy fetched here
const unreachable = (response) => response.status === 0 || response.status >= 500


function Message({ title, children }) {
    return (
        <section className="bake-view panel-message">
            <h2>{title}</h2>
            <p>{children}</p>
        </section>
    )
}


// The next step that isn't done, for the bake list
function nextStep(bake) {
    return bake.steps.find((step) => !step.skipped && !step.completed_at) || null
}


function BakeList({ bakes }) {
    if (!bakes.length) return <Message title="No bakes going">Start a bake with Fancy alerts on breadsheet.com.</Message>
    return (
        <section className="bake-view panel-list">
            <h2>Your bakes</h2>
            <ul>
                {bakes.map((bake) => {
                    const step = nextStep(bake)
                    return (
                        <li key={bake.id}>
                            <Link to={`/panel/${bake.id}`}>{bake.name}</Link>
                            {step && <span className="panel-next">
                                Next: {step.text}
                                {step.scheduled_at && <> · {formatStepTimeInZone(Date.parse(step.scheduled_at), bake.time_zone)}</>}
                            </span>}
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}


// /panel and /panel/<bake id> (breadsheet-hass#5): Home Assistant's sidebar panel shows this in a frame, with a
// panel token in the fragment (#t=...). One bake, or the list of active ones; a single bake opens directly.
export default function PanelPage() {
    const { bakeId } = useParams()
    const [ hasToken ] = useState(() => takePanelTokenFromUrl())
    const view = bakeId ?? ""  // "" for the list
    const [ result, setResult ] = useState({ view: null })

    useEffect(() => {
        if (!hasToken) return
        let current = true
        const load = bakeId ? getBake(bakeId) : listActiveBakes()
        load.then((response) => {
            if (!current) return
            if (response.ok && bakeId) rememberBake(response.data.bake)
            setResult({ view: bakeId ?? "", response })
        })
        return () => { current = false }
    }, [ bakeId, hasToken ])

    if (!hasToken) return <Message title="Breadsheet">{REOPEN}</Message>
    if (result.view !== view) return <section className="bake-view" aria-busy="true" />

    const { response } = result
    if (response.ok) {
        if (!bakeId) {
            const { bakes } = response.data
            if (bakes.length === 1) return <BakePage key={bakes[0].id} bake={bakes[0]} embedded={true} />
            return <BakeList bakes={bakes} />
        }
        return <BakePage key={response.data.bake.id} bake={response.data.bake} embedded={true} />
    }

    const cached = bakeId && unreachable(response) ? cachedBakeById(bakeId) : null
    if (cached) return <BakePage key={cached.id} bake={cached} offline={true} embedded={true} />
    if (response.code === "token_invalid") return <Message title="This view has expired">{REOPEN}</Message>
    if (response.status === 404) return <Message title="Bake not found">It may have ended. <Link to="/panel">See your bakes</Link>.</Message>
    return <Message title="Breadsheet can't be reached right now">{response.message}</Message>
}
