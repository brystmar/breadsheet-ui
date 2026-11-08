// Calendar export for a bake (breadsheet-ui#38), built in the browser from the bake the API returned.
// One event per scheduled step, written in UTC so calendar apps show local time across daylight-saving
// changes. UIDs are stable (bake suffix + step position) and SEQUENCE increases with each export, so
// re-importing can replace events instead of duplicating them.

const UNKNOWN_HANDS_ON_SECONDS = 10 * 60


// 20261114T180000Z
function icsTime(ms) {
    return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}


// Escapes TEXT values (RFC 5545 3.3.11)
function icsText(value) {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\r?\n/g, "\\n")
}


// Folds a content line to 75 octets, continuing with a space, without splitting a character
function fold(line) {
    const encoder = new TextEncoder()
    const out = []
    let current = ""
    let bytes = 0
    for (const char of line) {
        const size = encoder.encode(char).length
        const limit = out.length === 0 ? 75 : 74  // continuation lines start with a space
        if (bytes + size > limit) {
            out.push(current)
            current = ""
            bytes = 0
        }
        current += char
        bytes += size
    }
    out.push(current)
    return out.join("\r\n ")
}


// The .ics text for a bake. `origin` links each event back to the bake page.
export function bakeToIcs(bake, { now = Date.now(), origin = "" } = {}) {
    const stamp = icsTime(now)
    const sequence = Math.floor(now / 1000)  // increases with every export
    const url = origin && bake.path ? `${origin}${bake.path}` : null

    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//breadsheet//Second Rise//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        `X-WR-CALNAME:${icsText(bake.name)}`
    ]

    for (const step of bake.steps || []) {
        if (step.skipped || !step.scheduled_at) continue
        const start = Date.parse(step.scheduled_at)
        const seconds = step.hands_on?.seconds || UNKNOWN_HANDS_ON_SECONDS
        const summary = `${bake.name} · ${step.text}`

        lines.push(
            "BEGIN:VEVENT",
            `UID:${bake.suffix}-${step.position}@breadsheet.com`,
            `SEQUENCE:${sequence}`,
            `DTSTAMP:${stamp}`,
            `DTSTART:${icsTime(start)}`,
            `DTEND:${icsTime(start + seconds * 1000)}`,
            `SUMMARY:${icsText(summary)}`
        )
        if (step.note) lines.push(`DESCRIPTION:${icsText(step.note)}`)
        if (url) lines.push(`URL:${url}`)
        lines.push(
            "BEGIN:VALARM",
            "ACTION:DISPLAY",
            "TRIGGER:PT0S",
            `DESCRIPTION:${icsText(summary)}`,
            "END:VALARM",
            "END:VEVENT"
        )
    }

    lines.push("END:VCALENDAR")
    return lines.map(fold).join("\r\n") + "\r\n"
}


// "country-sourdough-pain-de-campagne.ics"
export function icsFileName(bake) {
    const base = String(bake.name || "bake").toLowerCase().normalize("NFKD")
        .replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    return `${base || "bake"}.ics`
}


// Downloads the bake's schedule as an .ics file
export function downloadIcs(bake) {
    const text = bakeToIcs(bake, { origin: window.location.origin })
    const url = URL.createObjectURL(new Blob([ text ], { type: "text/calendar;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = icsFileName(bake)
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}
