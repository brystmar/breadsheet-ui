// Bake view logic (breadsheet-ui#33): where a bake stands, and the same re-projection the server does, so
// a check-off or skip shows right away and keeps working while breadsheet is unreachable.
// Waits are in seconds; times are ISO strings as the API sends them, or epoch ms where noted.

const pad = (n) => String(n).padStart(2, "0")


// A length: "15m", "2h30m", "4h"
export function formatLength(seconds) {
    const minutes = Math.max(0, Math.round(seconds / 60))
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    if (hours === 0) return `${rest}m`
    return rest === 0 ? `${hours}h` : `${hours}h${pad(rest)}m`
}


// A countdown to `targetMs`: "00:10", "13:45"; never negative
export function formatCountdown(targetMs, nowMs) {
    const minutes = Math.max(0, Math.ceil((targetMs - nowMs) / 60000))
    return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}


const ms = (iso) => (iso ? Date.parse(iso) : null)
const iso = (time) => new Date(time).toISOString()
const isDone = (step) => Boolean(step.completed_at || step.skipped)


// Re-projects every step's scheduled time, exactly like the server: the anchor applies to the first step
// that isn't skipped (a finish anchor counts back the live steps' waits); each later step is due when the
// one before it was checked off (or was due) plus that step's wait. Skipped steps have no time.
export function projectBake(bake) {
    const steps = bake.steps.map((step) => ({ ...step }))
    const live = steps.filter((step) => !step.skipped)
    let time = ms(bake.anchor_time)
    if (bake.anchor_type === "finish") time -= live.reduce((sum, step) => sum + step.wait_chosen * 1000, 0)

    for (const step of steps) {
        if (step.skipped) {
            step.scheduled_at = null
            continue
        }
        step.scheduled_at = iso(time)
        time = (ms(step.completed_at) ?? time) + step.wait_chosen * 1000
    }
    return { ...bake, steps, projected_end: iso(time) }
}


// Applies a queued check-off or skip ({ type: "complete" | "skip", position, at }) to a bake.
// Already-done steps stay as they are: the first write wins, as on the server.
export function applyAction(bake, action) {
    if (bake.status === "completed") return bake
    const target = bake.steps.find((step) => step.position === action.position)
    if (!target || isDone(target)) return bake

    const steps = bake.steps.map((step) => {
        if (step.position !== action.position) return step
        return action.type === "complete" ? { ...step, completed_at: action.at } : { ...step, skipped: true, skipped_at: action.at }
    })
    const projected = projectBake({ ...bake, steps })

    if (projected.steps.every(isDone)) {
        const times = projected.steps.map((step) => ms(step.completed_at) ?? ms(step.skipped_at) ?? 0)
        return { ...projected, status: "completed", outcome: "finished", completed_at: iso(Math.max(...times)) }
    }
    const started = action.type === "complete" ? "in_progress" : projected.status
    return { ...projected, status: started }
}


// Where a bake stands: the step in progress (the latest checked-off step), the next step to do, and more
export function bakeProgress(bake) {
    const steps = bake.steps
    let current = -1
    steps.forEach((step, index) => { if (step.completed_at) current = index })
    const next = steps.findIndex((step, index) => index > current && !isDone(step))
    const remaining = steps.filter((step) => !isDone(step)).length
    const firstLive = steps.find((step) => !step.skipped && step.scheduled_at)
    const startedPartway = steps.length > 0 && steps[0].skipped && !steps[0].skipped_at

    return {
        current: current === -1 ? null : current,
        next: next === -1 ? null : next,
        remaining,
        nextIsLast: next !== -1 && remaining === 1,
        startMs: firstLive ? ms(firstLive.scheduled_at) : null,
        startedAtStep: startedPartway ? (steps.find((step) => !step.skipped)?.position ?? null) : null
    }
}


// The time a timeline row shows: when it was due, or for a skipped step, when it was skipped
// (steps skipped at the start show the bake's start)
export function timelineMs(step, startMs) {
    if (step.skipped) return ms(step.skipped_at) ?? startMs
    return ms(step.completed_at) ?? ms(step.scheduled_at)
}
