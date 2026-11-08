import { applyAction, bakeProgress, formatCountdown, formatLength, projectBake, timelineMs } from "./bake"

const HOUR = 3600
const T0 = Date.parse("2026-11-14T16:00:00Z")
const at = (seconds) => new Date(T0 + seconds * 1000).toISOString()

function bake(overrides = {}, stepOverrides = []) {
    const waits = [ HOUR, 2 * HOUR, 1800, 0 ]
    const steps = waits.map((wait, i) => ({
        position: i + 1, text: `Step ${i + 1}`, wait_chosen: wait, skipped: false, skipped_at: null,
        completed_at: null, scheduled_at: null, ...(stepOverrides[i] || {})
    }))
    return projectBake({ anchor_type: "start", anchor_time: at(0), status: "not_started", outcome: null, steps, ...overrides })
}


describe("lengths and countdowns", () => {
    test("formats lengths like 15m and 2h30m", () => {
        expect(formatLength(900)).toBe("15m")
        expect(formatLength(2.5 * HOUR)).toBe("2h30m")
        expect(formatLength(4 * HOUR)).toBe("4h")
        expect(formatLength(HOUR + 300)).toBe("1h05m")
        expect(formatLength(-60)).toBe("0m")
    })

    test("counts down in hh:mm, never below zero", () => {
        expect(formatCountdown(T0 + 10 * 60000, T0)).toBe("00:10")
        expect(formatCountdown(T0 + 13 * 3600000 + 45 * 60000, T0)).toBe("13:45")
        expect(formatCountdown(T0, T0 + 60000)).toBe("00:00")
    })
})


describe("projection", () => {
    test("runs forward from a start anchor", () => {
        expect(bake().steps.map((step) => step.scheduled_at)).toEqual([ at(0), at(HOUR), at(3 * HOUR), at(3.5 * HOUR) ])
        expect(bake().projected_end).toBe(at(3.5 * HOUR))
    })

    test("counts back from a finish anchor", () => {
        const finished = bake({ anchor_type: "finish", anchor_time: at(10 * HOUR) })
        expect(finished.steps[0].scheduled_at).toBe(at(6.5 * HOUR))
        expect(finished.projected_end).toBe(at(10 * HOUR))
    })

    test("later steps follow a check-off", () => {
        const done = applyAction(bake(), { type: "complete", position: 1, at: at(600) })
        expect(done.status).toBe("in_progress")
        expect(done.steps[1].scheduled_at).toBe(at(600 + HOUR))
    })

    test("a skipped step drops out, and its wait with it", () => {
        const skipped = applyAction(bake(), { type: "skip", position: 2, at: at(60) })
        expect(skipped.steps[1]).toMatchObject({ skipped: true, skipped_at: at(60), scheduled_at: null })
        expect(skipped.steps[2].scheduled_at).toBe(at(HOUR))
        expect(skipped.status).toBe("not_started")  // a skip doesn't start a bake
    })

    test("a skip before any check-off keeps a finish anchor's finish", () => {
        const finishing = bake({ anchor_type: "finish", anchor_time: at(10 * HOUR) })
        const skipped = applyAction(finishing, { type: "skip", position: 1, at: at(60) })
        expect(skipped.projected_end).toBe(at(10 * HOUR))
        expect(skipped.steps[1].scheduled_at).toBe(at(7.5 * HOUR))
    })

    test("the first write wins", () => {
        const once = applyAction(bake(), { type: "complete", position: 1, at: at(600) })
        expect(applyAction(once, { type: "complete", position: 1, at: at(900) })).toBe(once)
        expect(applyAction(once, { type: "skip", position: 1, at: at(900) })).toBe(once)
    })

    test("doing the last step finishes the bake", () => {
        let current = bake()
        for (const position of [ 1, 2, 3 ]) current = applyAction(current, { type: "complete", position, at: at(position * 60) })
        current = applyAction(current, { type: "skip", position: 4, at: at(600) })
        expect(current).toMatchObject({ status: "completed", outcome: "finished", completed_at: at(600) })
    })
})


describe("progress", () => {
    test("the step in progress is the latest checked off; next skips what's done", () => {
        const current = bake({ status: "in_progress" }, [ { completed_at: at(0) }, { completed_at: at(HOUR) }, { skipped: true, skipped_at: at(HOUR) } ])
        expect(bakeProgress(current)).toMatchObject({ current: 1, next: 3, remaining: 1, nextIsLast: true })
    })

    test("before any check-off, nothing is in progress", () => {
        expect(bakeProgress(bake())).toMatchObject({ current: null, next: 0, remaining: 4, nextIsLast: false, startMs: T0 })
    })

    test("notes a bake that started partway through", () => {
        const partway = bake({}, [ { skipped: true } ])
        expect(bakeProgress(partway).startedAtStep).toBe(2)
        // A step skipped at the start shows the bake's start; one skipped mid-bake shows when
        expect(timelineMs(partway.steps[0], T0 + 5)).toBe(T0 + 5)
        expect(timelineMs({ skipped: true, skipped_at: at(60) }, T0)).toBe(T0 + 60000)
    })
})
