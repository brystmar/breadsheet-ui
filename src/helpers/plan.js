// Plan view logic for v2 recipes (Second Rise): each step's waits, when it happens, and the body that
// saves the waits back to the recipe. Waits are in seconds.
import moment from "moment"

const MINUTE = 60


// The one date format the plan and bake screens use: "Nov 14, 2026 10:00"
export function formatPlanDate(ms) {
    return moment(ms).format("MMM D, YYYY HH:mm")
}


// A step's time in the schedule table: "Fri 08:35"
export function formatStepTime(ms) {
    return moment(ms).format("ddd HH:mm")
}


// The next quarter hour from `now`: where a new plan starts
export function nextQuarterHour(now = Date.now()) {
    const quarter = 15 * MINUTE * 1000
    return Math.ceil(now / quarter) * quarter
}


// The middle of a range, to the nearest minute: the wait a bake uses when a step has no Then Wait
export function middleOfRange(min, max) {
    return Math.round((min + max) / 2 / MINUTE) * MINUTE
}


// The plan's editable state for one v2 step. A missing range is just the Then Wait.
export function planStep(step) {
    const thenWait = step.then_wait ?? null
    const min = step.wait_min ?? thenWait ?? 0
    const max = step.wait_max ?? thenWait ?? min
    return { id: step.id, text: step.text, note: step.note || "", thenWait, min, max }
}


// The wait a step runs for: its Then Wait, or the middle of its range when it has none
export function effectiveWait(step) {
    return step.thenWait ?? middleOfRange(step.min, step.max)
}


// A Then Wait outside its range is allowed, but flagged
export function isOutOfRange(step) {
    return step.thenWait !== null && (step.thenWait < step.min || step.thenWait > step.max)
}


// When each step happens (epoch ms), from a start or finish time
export function stepTimes(steps, anchorMs, solveForStart) {
    const total = steps.reduce((sum, step) => sum + effectiveWait(step), 0)
    let time = solveForStart ? anchorMs : anchorMs - total * 1000
    const start = time

    const times = steps.map((step) => {
        const at = time
        time += effectiveWait(step) * 1000
        return at
    })
    return { times, start, finish: time, total }
}


// The full PUT /api/v2/recipes/<id> body: the recipe as loaded, with the plan's waits.
// `detailed` switches a Simple recipe to Detailed, so the recipe view shows the ranges just set.
export function recipeBody(recipe, steps, detailed = false) {
    const byId = new Map((recipe.steps || []).map((step) => [ step.id, step ]))

    return {
        name:          recipe.name,
        author:        recipe.author,
        source:        recipe.source,
        url:           recipe.url,
        difficulty:    recipe.difficulty,
        detail_level:  detailed ? "detailed" : recipe.detail_level,
        is_draft:      recipe.is_draft,
        category:      recipe.category,
        prerequisites: recipe.prerequisite_ids || [],
        steps:         steps.map((step) => {
            const original = byId.get(step.id) || {}
            return {
                id:             step.id,
                text:           original.text ?? step.text,
                note:           original.note ?? null,
                then_wait:      step.thenWait,
                wait_min:       step.min,
                wait_max:       step.max,
                active_seconds: original.active_seconds ?? null,
                needs_presence: original.needs_presence ?? null
            }
        })
    }
}
