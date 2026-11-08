// Waits typed and shown as "hh:mm" (plan view, Second Rise). Hours never roll into days: 30 hours is "30:00".

export const MAX_HHMM_SECONDS = (99 * 60 + 59) * 60  // 99:59
const MINUTE = 60


// Pads to two digits
function pad(number) {
    return String(number).padStart(2, "0")
}


// Seconds → "hh:mm", rounded to the nearest minute
export function formatHhmm(seconds = 0) {
    const minutes = Math.round(Math.max(0, seconds) / MINUTE)
    return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}


// "hh:mm" → seconds, or null when it can't be read.
// Extra minutes carry into hours (01:68 → 02:08), a bare number is minutes (90 → 01:30),
// and anything past 99:59 is capped there.
export function parseHhmm(text) {
    const value = String(text ?? "").trim()
    let hours, minutes

    const match = /^(\d{1,2}):(\d{1,4})$/.exec(value)
    if (match) {
        hours = Number(match[1])
        minutes = Number(match[2])
    } else if (/^\d{1,4}$/.test(value)) {
        hours = 0
        minutes = Number(value)
    } else {
        return null
    }

    return Math.min(MAX_HHMM_SECONDS, (hours * 60 + minutes) * MINUTE)
}


// One minute up or down, kept between 00:00 and 99:59
export function nudgeSeconds(seconds, minutes) {
    return Math.min(MAX_HHMM_SECONDS, Math.max(0, seconds + minutes * MINUTE))
}
