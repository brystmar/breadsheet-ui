// Times in a chosen IANA time zone, without a time zone library. The date picker works in the browser's
// own zone, so a bake planned for another zone keeps the picker's wall-clock time ("10:00") and reads it
// as that time in the chosen zone.

const MONTHS = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
const DAYS = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ]


// The browser's IANA time zone, e.g. "America/Los_Angeles"
export function browserTimeZone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    } catch {
        return "UTC"
    }
}


// Every time zone the browser knows, with the browser's own first
export function timeZoneOptions(own = browserTimeZone()) {
    let zones = []
    try {
        zones = Intl.supportedValuesOf("timeZone")
    } catch {
        // Older browsers: just the browser's zone and UTC
    }
    const rest = zones.filter((zone) => zone !== own)
    if (own !== "UTC" && !rest.includes("UTC")) rest.push("UTC")
    return [ own, ...rest ]
}


// The wall-clock fields of an instant in `zone`
function wallFields(ms, zone) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: zone, hourCycle: "h23", weekday: "short",
        year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric"
    }).formatToParts(ms)
    const field = (type) => parts.find((part) => part.type === type)?.value
    return {
        year: Number(field("year")), month: Number(field("month")), day: Number(field("day")),
        hour: Number(field("hour")) % 24, minute: Number(field("minute")), second: Number(field("second")),
        weekday: DAYS.indexOf(field("weekday"))
    }
}


// How far `zone` is ahead of UTC at an instant, in ms
function offsetMs(ms, zone) {
    const wall = wallFields(ms, zone)
    const asUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second)
    return asUtc - Math.floor(ms / 1000) * 1000
}


// The instant (epoch ms) when the clocks in `zone` show the wall time held in `date`'s local fields
export function wallTimeToInstant(date, zone) {
    const wall = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes())
    const first = wall - offsetMs(wall, zone)
    // Once more from the first guess, in case a daylight-saving change sits between the two
    return wall - offsetMs(first, zone)
}


// A Date whose local fields show what the clocks in `zone` read at `ms`, for the date picker
export function instantToWallDate(ms, zone) {
    const wall = wallFields(ms, zone)
    return new Date(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute)
}


const pad = (n) => String(n).padStart(2, "0")


// "Nov 14, 2026 10:00" in `zone`: the plan's date format
export function formatInZone(ms, zone) {
    const wall = wallFields(ms, zone)
    return `${MONTHS[wall.month - 1]} ${wall.day}, ${wall.year} ${pad(wall.hour)}:${pad(wall.minute)}`
}


// "Fri 08:35" in `zone`: a step's time in a schedule
export function formatStepTimeInZone(ms, zone) {
    const wall = wallFields(ms, zone)
    return `${DAYS[wall.weekday]} ${pad(wall.hour)}:${pad(wall.minute)}`
}
