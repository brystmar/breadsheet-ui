import { useCallback, useEffect, useRef, useState } from "react"
import { updateRecipe } from "../data/recipes_api"

const SAVE_DELAY_MS = 400


// Saves a recipe as it's edited, without racing: changes made close together become one save, only one
// save is in flight at a time, and the newest body always wins. A failed save keeps the body so Retry can
// send it again (the page keeps showing the user's changes either way).
// status: "idle", "saving", or "error"
export default function useRecipeSaver(recipeId, onSaved) {
    const [ status, setStatus ] = useState("idle")
    const pending = useRef(null)
    const failed = useRef(null)
    const inFlight = useRef(false)
    const timer = useRef(null)
    const savedCallback = useRef(onSaved)
    savedCallback.current = onSaved

    // Sends the newest body, then anything that arrived meanwhile
    const flush = useCallback(async () => {
        timer.current = null
        if (inFlight.current || pending.current === null) return

        const body = pending.current
        pending.current = null
        inFlight.current = true
        setStatus("saving")
        const result = await updateRecipe(recipeId, body)
        inFlight.current = false

        if (result.ok) {
            failed.current = null
            savedCallback.current?.(result.data.recipe)
        } else {
            failed.current = body
        }

        if (pending.current !== null) {
            flush()
        } else {
            setStatus(result.ok ? "idle" : "error")
        }
    }, [ recipeId ])

    // Queues a save of the full recipe body
    const save = useCallback((body) => {
        pending.current = body
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(flush, SAVE_DELAY_MS)
    }, [ flush ])

    // Sends the last failed body again
    const retry = useCallback(() => {
        if (failed.current && pending.current === null) save(failed.current)
    }, [ save ])

    // Leaving the page sends a waiting change right away instead of dropping it
    useEffect(() => () => {
        if (timer.current) {
            clearTimeout(timer.current)
            if (pending.current !== null) updateRecipe(recipeId, pending.current)
        }
    }, [ recipeId ])

    return { save, retry, status }
}
