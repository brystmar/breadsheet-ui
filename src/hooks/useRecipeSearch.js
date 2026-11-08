import { useEffect, useState } from "react"

const TYPING_PAUSE_MS = 250


// A recipe list with search and a category filter. `load(filters)` is a list call returning apiCall's
// shape; it reruns when the filters change (after a short pause in typing) or when `reloadKey` does.
export default function useRecipeSearch(load, reloadKey = null) {
    const [ q, setQ ] = useState("")
    const [ category, setCategory ] = useState("")
    const [ state, setState ] = useState({ status: "loading", recipes: [], message: null })

    useEffect(() => {
        let current = true
        const timer = setTimeout(async () => {
            const result = await load({ q, category })
            if (!current) return
            setState(result.ok ? { status: "ready", recipes: result.data?.recipes ?? [], message: null } :
                { status: "error", recipes: [], message: result.message })
        }, q ? TYPING_PAUSE_MS : 0)
        return () => {
            current = false
            clearTimeout(timer)
        }
    }, [ load, q, category, reloadKey ])

    return { q, setQ, category, setCategory, ...state }
}
