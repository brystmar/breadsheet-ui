import { formatInZone, formatStepTimeInZone, instantToWallDate, timeZoneOptions, wallTimeToInstant } from "./zoned"


describe("times in a chosen zone", () => {
    test("reads a wall-clock time as that time in the zone", () => {
        const tenAm = new Date(2026, 10, 14, 10, 0)  // Nov 14, 10:00 on the picker
        expect(new Date(wallTimeToInstant(tenAm, "America/Los_Angeles")).toISOString()).toBe("2026-11-14T18:00:00.000Z")
        expect(new Date(wallTimeToInstant(tenAm, "America/New_York")).toISOString()).toBe("2026-11-14T15:00:00.000Z")
        expect(new Date(wallTimeToInstant(tenAm, "UTC")).toISOString()).toBe("2026-11-14T10:00:00.000Z")
    })

    test("handles a daylight-saving change", () => {
        // Nov 1, 2026: Los Angeles moves from UTC-7 to UTC-8 at 02:00
        expect(new Date(wallTimeToInstant(new Date(2026, 10, 1, 0, 30), "America/Los_Angeles")).toISOString())
            .toBe("2026-11-01T07:30:00.000Z")
        expect(new Date(wallTimeToInstant(new Date(2026, 10, 1, 9, 0), "America/Los_Angeles")).toISOString())
            .toBe("2026-11-01T17:00:00.000Z")
    })

    test("round-trips through the picker's wall time", () => {
        const ms = Date.parse("2026-11-14T18:00:00Z")
        const wall = instantToWallDate(ms, "America/Chicago")
        expect([ wall.getHours(), wall.getMinutes() ]).toEqual([ 12, 0 ])
        expect(wallTimeToInstant(wall, "America/Chicago")).toBe(ms)
    })

    test("formats in the plan's date format", () => {
        const ms = Date.parse("2026-11-14T18:05:00Z")
        expect(formatInZone(ms, "America/Los_Angeles")).toBe("Nov 14, 2026 10:05")
        expect(formatInZone(ms, "Asia/Tokyo")).toBe("Nov 15, 2026 03:05")
        expect(formatStepTimeInZone(ms, "America/Los_Angeles")).toBe("Sat 10:05")
    })

    test("lists the browser's zone first", () => {
        const zones = timeZoneOptions("Europe/Paris")
        expect(zones[0]).toBe("Europe/Paris")
        expect(zones.filter((zone) => zone === "Europe/Paris")).toHaveLength(1)
        expect(zones).toContain("UTC")
    })
})
