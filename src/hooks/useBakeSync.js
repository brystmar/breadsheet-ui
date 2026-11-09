import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { cancelBake, changeAlertMode, completeBake, completeStep, getBake, skipStep } from "../data/bakes_api"
import { applyAction } from "../helpers/bake"

const MAX_BACKOFF_MS = 60 * 1000


// Remembered per bake in this browser, so a queued tap survives a reload during an outage
const queueKey = (bakeId) => `breadsheet.bakeQueue.${bakeId}`
const cacheKey = (suffix) => `breadsheet.bake.${suffix}`

function readJson(key, fallback) {
    try {
        const stored = window.localStorage.getItem(key)
        return stored ? JSON.parse(stored) : fallback
    } catch {
        return fallback
    }
}

function writeJson(key, value) {
    try {
        if (value === null) window.localStorage.removeItem(key)
        else window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
        // Storage can be blocked; the bake still works, just without surviving a reload offline
    }
}


// The last copy of a bake fetched in this browser, for when breadsheet can't be reached
export function cachedBake(suffix) {
    return readJson(cacheKey(suffix), null)
}

export function rememberBake(bake) {
    if (!bake?.suffix) return
    writeJson(cacheKey(bake.suffix), bake)
}


// Network trouble and server outages are worth retrying; anything else is a real answer
const retryable = (result) => result.status === 0 || result.status === 408 || result.status === 429 || result.status >= 500


// A bake that keeps working while breadsheet is unreachable (breadsheet-ui#33, spec: Resilience).
// Done and Skip taps record their time, show at once, queue, and retry with backoff (honoring
// Retry-After) until the server confirms. Check-offs are idempotent, so a late retry lands exactly
// as an on-time one would have.
// `onSynced(bake)` hears about each copy confirmed by the server. A new `initialBake` (say, from a refreshed
// list) replaces the server copy when no taps are waiting.
export default function useBakeSync(initialBake, { onSynced } = {}) {
    const bakeId = initialBake.id
    const [ serverBake, setServerBake ] = useState(initialBake)
    const [ queue, setQueue ] = useState(() => readJson(queueKey(bakeId), []))
    const [ problem, setProblem ] = useState(null)

    const queueRef = useRef(queue)
    const inFlight = useRef(false)
    const timer = useRef(null)
    const attempts = useRef(0)
    const mounted = useRef(true)

    useEffect(() => {
        mounted.current = true
        return () => {
            mounted.current = false
            clearTimeout(timer.current)
        }
    }, [])

    useEffect(() => {
        queueRef.current = queue
        writeJson(queueKey(bakeId), queue.length ? queue : null)
    }, [ bakeId, queue ])

    const onSyncedRef = useRef(onSynced)
    onSyncedRef.current = onSynced

    useEffect(() => {
        if (!queueRef.current.length) setServerBake(initialBake)
    }, [ initialBake ])

    const accept = useCallback((bake) => {
        rememberBake(bake)
        setServerBake(bake)
        onSyncedRef.current?.(bake)
    }, [])

    // Sends the oldest queued tap; the effect below sends the next once it's confirmed
    const flush = useCallback(async () => {
        const action = queueRef.current[0]
        if (!action || inFlight.current || timer.current) return

        inFlight.current = true
        const send = action.type === "complete" ? completeStep : skipStep
        const result = await send(bakeId, action.position, action.at)
        inFlight.current = false
        if (!mounted.current) return

        if (result.ok) {
            attempts.current = 0
            accept(result.data.bake)
            setQueue((current) => current.slice(1))
            return
        }
        if (retryable(result)) {
            attempts.current += 1
            const backoff = Math.min(MAX_BACKOFF_MS, 2000 * 2 ** (attempts.current - 1))
            const delay = result.retryAfter ? result.retryAfter * 1000 : backoff
            timer.current = setTimeout(() => {
                timer.current = null
                flush()
            }, delay)
            return
        }

        // Refused (say, the bake was finished elsewhere): drop it, say why, and show the server's copy
        attempts.current = 0
        setProblem(result.message)
        setQueue((current) => current.slice(1))
        const fresh = await getBake(bakeId)
        if (fresh.ok && mounted.current) accept(fresh.data.bake)
    }, [ bakeId, accept ])

    useEffect(() => {
        if (queue.length) flush()
    }, [ queue, flush ])

    // Back online, or back to the tab: retry now instead of waiting out the backoff, and catch up
    useEffect(() => {
        function retryNow() {
            if (document.visibilityState === "hidden") return
            if (queueRef.current.length) {
                clearTimeout(timer.current)
                timer.current = null
                flush()
            } else if (!inFlight.current) {
                getBake(bakeId).then((fresh) => {
                    if (fresh.ok && mounted.current && !queueRef.current.length) accept(fresh.data.bake)
                })
            }
        }
        window.addEventListener("online", retryNow)
        document.addEventListener("visibilitychange", retryNow)
        return () => {
            window.removeEventListener("online", retryNow)
            document.removeEventListener("visibilitychange", retryNow)
        }
    }, [ bakeId, flush, accept ])

    // The bake as the baker sees it: the server's copy with their unconfirmed taps on top
    const bake = useMemo(() => queue.reduce(applyAction, serverBake), [ serverBake, queue ])

    const record = useCallback((type, position) => {
        setProblem(null)
        setQueue((current) => [ ...current, { type, position, at: new Date().toISOString() } ])
    }, [])

    // Complete and Cancel need the server; they report a message when it can't be reached
    const end = useCallback(async (how) => {
        setProblem(null)
        const result = how === "complete" ? await completeBake(bakeId, new Date().toISOString()) : await cancelBake(bakeId)
        if (!mounted.current) return
        if (result.ok) accept(result.data.bake)
        else setProblem(result.message)
    }, [ bakeId, accept ])

    // Switching alerts needs the server too; returns the result so the caller can explain a refusal
    const changeAlerts = useCallback(async (mode) => {
        setProblem(null)
        const result = await changeAlertMode(bakeId, mode)
        if (mounted.current && result.ok) accept(result.data.bake)
        return result
    }, [ bakeId, accept ])

    return {
        bake,
        changeAlerts,
        pending: queue.length > 0,
        problem,
        checkOff: (position) => record("complete", position),
        skip: (position) => record("skip", position),
        complete: () => end("complete"),
        cancel: () => end("cancel")
    }
}
