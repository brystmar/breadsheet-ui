import { useCallback, useEffect, useState } from "react"
import { bakeProgress, formatLength } from "../helpers/bake"

// In-tab browser notifications (M2, breadsheet-ui#34): while a bake view is open, a notification when the
// next step is due. No server scheduling and no Web Push; closing the tab stops them.

const CHECK_MS = 15 * 1000
const STALE_MS = 10 * 60 * 1000          // a step more overdue than this when first seen gets no notification
const PREFERENCE_KEY = "breadsheet.notifications"
const SENT_KEY = "breadsheet.notified"
const SENT_LIMIT = 200


function readStorage(key, fallback) {
    try {
        return window.localStorage.getItem(key) ?? fallback
    } catch {
        return fallback
    }
}

function writeStorage(key, value) {
    try {
        window.localStorage.setItem(key, value)
    } catch {
        // Blocked storage: notifications still work, they just may repeat after a reload
    }
}


// "unsupported", "default" (not asked yet), "granted", or "denied"
function permissionNow() {
    return typeof window !== "undefined" && "Notification" in window ? window.Notification.permission : "unsupported"
}


// Each step is notified once per scheduled time, remembered across reloads and tabs. The time is compared
// to the minute: a tap's local projection and the server's copy write the same moment differently.
const sentKey = (bake, step) => `${bake.suffix}-${step.position}-${Math.round(Date.parse(step.scheduled_at) / 60000)}`

function alreadySent(key) {
    try {
        return JSON.parse(readStorage(SENT_KEY, "[]")).includes(key)
    } catch {
        return false
    }
}

function markSent(key) {
    let sent = []
    try {
        sent = JSON.parse(readStorage(SENT_KEY, "[]"))
    } catch {
        // Start over
    }
    writeStorage(SENT_KEY, JSON.stringify([ ...sent, key ].slice(-SENT_LIMIT)))
}


// The step to notify about now, if any: the next step, once it's due (and not long overdue)
export function dueStep(bake, now) {
    if (!bake || bake.status === "completed") return null
    const { next } = bakeProgress(bake)
    if (next === null) return null
    const step = bake.steps[next]
    const at = Date.parse(step.scheduled_at)
    if (Number.isNaN(at) || at > now || now - at > STALE_MS) return null
    return alreadySent(sentKey(bake, step)) ? null : step
}


function notify(bake, step) {
    const notification = new window.Notification(`Time for: ${step.text}`, {
        body: `${bake.name} · step ${step.position} of ${bake.steps.length}` +
            (step.wait_chosen ? ` · then wait ${formatLength(step.wait_chosen)}` : ""),
        tag: `breadsheet-${bake.suffix}`
    })
    notification.onclick = () => {
        window.focus()
        notification.close()
    }
}


// { permission, enabled, turnOn(), turnOff() }. Notifications run only while enabled: permission granted
// and not turned off in this browser.
export default function useStepNotifications(bake) {
    const [ permission, setPermission ] = useState(permissionNow)
    const [ preference, setPreference ] = useState(() => readStorage(PREFERENCE_KEY, "on"))
    const enabled = permission === "granted" && preference !== "off"

    useEffect(() => {
        if (!enabled) return

        function check() {
            const step = dueStep(bake, Date.now())
            if (!step) return
            markSent(sentKey(bake, step))
            notify(bake, step)
        }

        check()
        const id = setInterval(check, CHECK_MS)
        document.addEventListener("visibilitychange", check)
        return () => {
            clearInterval(id)
            document.removeEventListener("visibilitychange", check)
        }
    }, [ enabled, bake ])

    // Asking needs a click, so it only happens from the button
    const turnOn = useCallback(async () => {
        writeStorage(PREFERENCE_KEY, "on")
        setPreference("on")
        if (permissionNow() === "default") setPermission(await window.Notification.requestPermission())
        else setPermission(permissionNow())
    }, [])

    const turnOff = useCallback(() => {
        writeStorage(PREFERENCE_KEY, "off")
        setPreference("off")
    }, [])

    return { permission, enabled, turnOn, turnOff }
}
