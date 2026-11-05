import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import useFeatureLevel from "./useFeatureLevel"
import { getSession, signOut as apiSignOut } from "../data/session_api"

const SessionContext = createContext(null)


// Who's signed in on this browser. Sessions are an M2 feature, so at M1 this never calls the API.
// status: "idle" (M1, not checked), "loading", "signedIn", or "signedOut"
export function SessionProvider({ children }) {
    const { atLeast } = useFeatureLevel()
    const enabled = atLeast("m2")

    const [ user, setUser ] = useState(null)
    const [ status, setStatus ] = useState(enabled ? "loading" : "idle")

    // Ask the API once whenever M2 features turn on
    useEffect(() => {
        if (!enabled) {
            setStatus("idle")
            return
        }

        let cancelled = false
        setStatus("loading")
        getSession().then((result) => {
            if (cancelled) return
            const sessionUser = result.ok ? result.data?.user : null
            setUser(sessionUser || null)
            setStatus(sessionUser ? "signedIn" : "signedOut")
        })
        return () => { cancelled = true }
    }, [ enabled ])

    // Called after registering or signing in
    const signedIn = useCallback((newUser) => {
        setUser(newUser)
        setStatus("signedIn")
    }, [])

    // Signs this browser out; the local state clears even if the request fails
    const signOut = useCallback(async () => {
        const result = await apiSignOut()
        setUser(null)
        setStatus("signedOut")
        return result
    }, [])

    const value = useMemo(() => ({ user, status, signedIn, signOut }), [ user, status, signedIn, signOut ])

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}


// { user, status, signedIn(user), signOut() }
export default function useSession() {
    const context = useContext(SessionContext)
    if (context === null) throw new Error("useSession must be used inside a SessionProvider")
    return context
}
