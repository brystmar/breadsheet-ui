import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { atLeast, isFeatureLevel, isFeatureLevelStorageKey, readStoredLevel, storeLevel } from "../helpers/feature_levels"

const FeatureLevelContext = createContext(null)


// Holds this browser's feature level for the whole app (see helpers/feature_levels.js)
export function FeatureLevelProvider({ children }) {
    const [ level, setLevelState ] = useState(readStoredLevel)

    // Changing the level saves it, so it survives reloads
    const setLevel = useCallback((newLevel) => {
        if (!isFeatureLevel(newLevel)) return
        storeLevel(newLevel)
        setLevelState(newLevel)
    }, [])

    // Keep every open tab on the same level
    useEffect(() => {
        function handleStorage(event) {
            if (isFeatureLevelStorageKey(event.key)) setLevelState(readStoredLevel())
        }

        window.addEventListener("storage", handleStorage)
        return () => window.removeEventListener("storage", handleStorage)
    }, [])

    const value = useMemo(() => ({
        level,
        setLevel,
        atLeast: (minimum) => atLeast(level, minimum)
    }), [ level, setLevel ])

    return <FeatureLevelContext.Provider value={value}>{children}</FeatureLevelContext.Provider>
}


// The current level, a setter, and atLeast(minimum) for deciding what to show
export default function useFeatureLevel() {
    const context = useContext(FeatureLevelContext)
    if (context === null) throw new Error("useFeatureLevel must be used inside a FeatureLevelProvider")
    return context
}


// Renders its children only at `min` or above, e.g. <AtFeatureLevel min="m2"><NewThing /></AtFeatureLevel>
export function AtFeatureLevel({ min, children, fallback = null }) {
    const { atLeast } = useFeatureLevel()
    return atLeast(min) ? children : fallback
}
