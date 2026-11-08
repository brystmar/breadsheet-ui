import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import PageTitle from "../PageTitle"
import BakePage from "./BakePage"
import useSession from "../../hooks/useSession"
import { bakeBySuffix } from "../../data/bakes_api"
import { cachedBake, rememberBake } from "../../hooks/useBakeSync"
import "../../styles/bake-view.sass"


// Network trouble and outages fall back to the last copy fetched in this browser
const unreachable = (response) => response.status === 0 || response.status >= 500


// /bakes/<suffix> (M2): loads the signed-in user's bake and shows the bake view. If breadsheet can't be
// reached, the bake keeps running from the last copy this browser fetched.
export default function BakePathContainer() {
    const { suffix } = useParams()
    const { status: sessionStatus } = useSession()
    const [ result, setResult ] = useState({ suffix: null })

    useEffect(() => {
        let current = true

        // Without a session check (offline), a cached copy still shows
        if (sessionStatus === "loading" || sessionStatus === "signedOut") return
        bakeBySuffix(suffix).then((response) => {
            if (!current) return
            if (response.ok) rememberBake(response.data.bake)
            setResult({ suffix, response })
        })
        return () => { current = false }
    }, [ suffix, sessionStatus ])

    if (sessionStatus === "signedOut") {
        const cached = cachedBake(suffix)
        if (cached) return <BakePage key={cached.id} bake={cached} offline={true} />
        return (
            <section className="bake-view">
                <PageTitle title="Bake" includeHr={true} />
                <p>Bakes are private. <Link to="/signin" state={{ from: `/bakes/${suffix}` }}>Sign in</Link> to see yours.</p>
            </section>
        )
    }
    if (result.suffix !== suffix) return <PageTitle title="" includeHr={true} />

    const { response } = result
    if (response.ok) return <BakePage key={response.data.bake.id} bake={response.data.bake} />

    const cached = unreachable(response) ? cachedBake(suffix) : null
    if (cached) return <BakePage key={cached.id} bake={cached} offline={true} />

    return (
        <section className="bake-view">
            <PageTitle title={response.status === 404 ? "Bake not found" : "Something went wrong"} includeHr={true} />
            <p>{response.message}</p>
            <p><Link to="/">See all recipes</Link></p>
        </section>
    )
}
