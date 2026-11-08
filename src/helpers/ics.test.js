import { bakeToIcs, icsFileName } from "./ics"

const BAKE = {
    suffix: "b4k3x9", path: "/bakes/b4k3x9", name: "Country Sourdough: Pain de Campagne",
    steps: [
        { position: 1, text: "Feed the levain", note: null, skipped: true, scheduled_at: null, hands_on: { seconds: null } },
        { position: 2, text: "Mix, then rest", note: "Wet hands; 75°F water", skipped: false,
          scheduled_at: "2026-11-14T18:00:00+00:00", hands_on: { seconds: 900 } },
        { position: 3, text: "Fold #1 (of 4)", note: null, skipped: false,
          scheduled_at: "2026-11-14T18:30:00+00:00", hands_on: { seconds: null } }
    ]
}
const NOW = Date.parse("2026-11-14T17:00:00Z")


describe("ICS export", () => {
    const ics = bakeToIcs(BAKE, { now: NOW, origin: "https://www.breadsheet.com" })
    const unfolded = ics.replace(/\r\n /g, "")

    test("is a calendar with CRLF line endings", () => {
        expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true)
        expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true)
        expect(ics.replace(/\r\n/g, "")).not.toMatch(/\n/)
    })

    test("has one event per scheduled step, leaving out skipped ones", () => {
        expect(unfolded.match(/BEGIN:VEVENT/g)).toHaveLength(2)
        expect(unfolded).not.toContain("Feed the levain")
    })

    test("writes UTC times, lasting the hands-on time or 10 minutes when unknown", () => {
        expect(unfolded).toContain("DTSTART:20261114T180000Z\r\nDTEND:20261114T181500Z")
        expect(unfolded).toContain("DTSTART:20261114T183000Z\r\nDTEND:20261114T184000Z")
    })

    test("uses stable UIDs and an increasing SEQUENCE", () => {
        expect(unfolded).toContain("UID:b4k3x9-2@breadsheet.com")
        expect(unfolded).toContain("UID:b4k3x9-3@breadsheet.com")
        expect(unfolded).toContain(`SEQUENCE:${NOW / 1000}`)
        const later = bakeToIcs(BAKE, { now: NOW + 60000 })
        expect(later).toContain(`SEQUENCE:${NOW / 1000 + 60}`)
    })

    test("titles events with the bake and step, escaping text", () => {
        expect(unfolded).toContain("SUMMARY:Country Sourdough: Pain de Campagne · Mix\\, then rest")
        expect(unfolded).toContain("DESCRIPTION:Wet hands\\; 75°F water")
        expect(unfolded).toContain("URL:https://www.breadsheet.com/bakes/b4k3x9")
    })

    test("alerts at the start of each step", () => {
        expect(unfolded.match(/TRIGGER:PT0S/g)).toHaveLength(2)
    })

    test("folds long lines to 75 octets", () => {
        for (const line of ics.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
    })

    test("names the file after the bake", () => {
        expect(icsFileName(BAKE)).toBe("country-sourdough-pain-de-campagne.ics")
        expect(icsFileName({ name: "Crème brûlée" })).toBe("creme-brulee.ics")
    })
})
