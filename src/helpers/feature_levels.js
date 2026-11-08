// Milestone feature levels: Second Rise work ships to production hidden, and this browser-only
// setting decides which milestone's features the UI shows. M2 (Second Rise: accounts, bakes, community) is
// the default since 2026-11-07; `m1` is the original app, still selectable from the footer.
// Releasing a milestone means changing DEFAULT_LEVEL (and dropping levels nobody should pick anymore).
export const FEATURE_LEVELS = [ "m1", "m2" ]
export const DEFAULT_LEVEL = "m2"

const STORAGE_KEY = "breadsheet.featureLevel"


// Whether `level` is a level this build knows about
export function isFeatureLevel(level) {
    return FEATURE_LEVELS.includes(level)
}


// True when `level` includes everything from `minimum`, e.g. atLeast("m2", "m1") is true
export function atLeast(level, minimum) {
    return FEATURE_LEVELS.indexOf(level) >= FEATURE_LEVELS.indexOf(minimum)
}


// The level saved in this browser, or the default when nothing valid is saved.
// Storage can be blocked (private windows, strict privacy settings), so failures fall back quietly.
export function readStoredLevel() {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        return isFeatureLevel(stored) ? stored : DEFAULT_LEVEL
    } catch {
        return DEFAULT_LEVEL
    }
}


// Saves the level for this browser; returns false when storage is unavailable
export function storeLevel(level) {
    try {
        window.localStorage.setItem(STORAGE_KEY, level)
        return true
    } catch {
        return false
    }
}


// Other tabs change the setting through `storage` events, which carry this key
export function isFeatureLevelStorageKey(key) {
    return key === STORAGE_KEY
}
