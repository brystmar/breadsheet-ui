import { formatHhmm, nudgeSeconds, parseHhmm } from "./hhmm"
import { effectiveWait, isOutOfRange, middleOfRange, planStep, recipeBody, stepTimes } from "./plan"

const HOUR = 3600


describe("hh:mm", () => {
    test("formats seconds without rolling into days", () => {
        expect(formatHhmm(0)).toBe("00:00")
        expect(formatHhmm(900)).toBe("00:15")
        expect(formatHhmm(30 * HOUR)).toBe("30:00")
        expect(formatHhmm(99 * HOUR + 59 * 60)).toBe("99:59")
    })

    test("reads hh:mm, carrying extra minutes into hours", () => {
        expect(parseHhmm("02:30")).toBe(2.5 * HOUR)
        expect(parseHhmm("1:68")).toBe(2 * HOUR + 8 * 60)
        expect(parseHhmm(" 00:05 ")).toBe(300)
    })

    test("reads a bare number as minutes", () => {
        expect(parseHhmm("90")).toBe(1.5 * HOUR)
    })

    test("caps at 99:59 and refuses what it can't read", () => {
        expect(parseHhmm("99:75")).toBe(99 * HOUR + 59 * 60)
        for (const value of [ "", "abc", "1:2:3", "-5", "1.5", "100:00" ]) expect(parseHhmm(value)).toBeNull()
    })

    test("nudges by a minute within 00:00 and 99:59", () => {
        expect(nudgeSeconds(600, 1)).toBe(660)
        expect(nudgeSeconds(0, -1)).toBe(0)
        expect(nudgeSeconds(99 * HOUR + 59 * 60, 1)).toBe(99 * HOUR + 59 * 60)
    })
})


describe("plan steps", () => {
    test("a simple step's range is its Then Wait", () => {
        expect(planStep({ id: "s1", text: "Mix", then_wait: 900 })).toEqual(
            { id: "s1", text: "Mix", note: "", thenWait: 900, min: 900, max: 900 })
    })

    test("a range without a Then Wait runs for the middle, rounded to the minute", () => {
        const step = planStep({ id: "s1", text: "Rise", then_wait: null, wait_min: HOUR, wait_max: 2 * HOUR + 30 })
        expect(effectiveWait(step)).toBe(middleOfRange(HOUR, 2 * HOUR + 30))
        expect(effectiveWait(step) % 60).toBe(0)
        expect(isOutOfRange(step)).toBe(false)
    })

    test("a Then Wait outside its range is flagged", () => {
        expect(isOutOfRange({ thenWait: 0, min: 12 * HOUR, max: 24 * HOUR })).toBe(true)
        expect(isOutOfRange({ thenWait: 7 * HOUR, min: 6 * HOUR, max: 8 * HOUR })).toBe(false)
    })

    test("times run forward from a start or back from a finish", () => {
        const steps = [ { thenWait: HOUR, min: HOUR, max: HOUR }, { thenWait: 0, min: 0, max: 0 } ]
        expect(stepTimes(steps, 0, true)).toEqual({ times: [ 0, HOUR * 1000 ], start: 0, finish: HOUR * 1000, total: HOUR })
        expect(stepTimes(steps, HOUR * 1000, false).times).toEqual([ 0, HOUR * 1000 ])
    })
})


describe("recipeBody", () => {
    const RECIPE = {
        name: "Loaf", author: null, source: "Book", url: null, difficulty: "Beginner", detail_level: "simple",
        is_draft: false, category: "bread", prerequisite_ids: [ "p1" ],
        steps: [ { id: "s1", text: "Mix", note: "Gently", then_wait: 900, wait_min: 900, wait_max: 900,
                   active_seconds: 300, needs_presence: true } ]
    }

    test("keeps the recipe and its step details, with the plan's waits", () => {
        const body = recipeBody(RECIPE, [ { id: "s1", text: "Mix", thenWait: 1200, min: 600, max: 1800 } ])
        expect(body).toEqual({
            name: "Loaf", author: null, source: "Book", url: null, difficulty: "Beginner", detail_level: "simple",
            is_draft: false, category: "bread", prerequisites: [ "p1" ],
            steps: [ { id: "s1", text: "Mix", note: "Gently", then_wait: 1200, wait_min: 600, wait_max: 1800,
                       active_seconds: 300, needs_presence: true } ]
        })
    })

    test("can switch a Simple recipe to Detailed", () => {
        expect(recipeBody(RECIPE, [], true).detail_level).toBe("detailed")
    })
})
