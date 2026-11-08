import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useLocation } from "react-router"
import useFeatureLevel from "./useFeatureLevel"
import useSession from "./useSession"
import { listActiveBakes } from "../data/bakes_api"

const ActiveBakesContext = createContext({ bakes: [], refresh: () => {} })


// The signed-in user's active bakes (M2), shared by the active bake bar and the home page list.
// Refreshed on sign-in, on every page change (cheap, and it catches check-offs made on the bake view),
// and when the tab comes back into view. A failed refresh keeps the last list.
export function ActiveBakesProvider({ children }) {
    const { atLeast } = useFeatureLevel()
    const enabled = atLeast("m2")
    const { status } = useSession()
    const { pathname } = useLocation()
    const [ bakes, setBakes ] = useState([])
    const latest = useRef(0)

    const signedIn = enabled && status === "signedIn"

    const refresh = useCallback(async () => {
        if (!signedIn) return
        const request = ++latest.current
        const result = await listActiveBakes()
        // Only the newest answer counts
        if (result.ok && request === latest.current) setBakes(result.data?.bakes ?? [])
    }, [ signedIn ])

    useEffect(() => {
        if (signedIn) refresh()
        else setBakes([])
    }, [ signedIn, pathname, refresh ])

    useEffect(() => {
        function onVisible() {
            if (document.visibilityState === "visible") refresh()
        }
        document.addEventListener("visibilitychange", onVisible)
        return () => document.removeEventListener("visibilitychange", onVisible)
    }, [ refresh ])

    const value = useMemo(() => ({ bakes, refresh }), [ bakes, refresh ])
    return <ActiveBakesContext.Provider value={value}>{children}</ActiveBakesContext.Provider>
}


// { bakes, refresh() }
export default function useActiveBakes() {
    return useContext(ActiveBakesContext)
}
