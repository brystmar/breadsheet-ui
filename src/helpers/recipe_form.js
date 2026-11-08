// The recipe editor's form (breadsheet-ui#31): a v2 recipe as editable state, and back to a full PUT body.
// Waits are in seconds. Hands-on time is edited in minutes; blank means unknown, which is not zero.

export const DIFFICULTIES = [ "Beginner", "Intermediate", "Advanced", "Expert" ]

let nextKey = 0
const newKey = () => `new-${++nextKey}`


// One step as the editor holds it
export function formStep(step) {
    return {
        key:           step.id || newKey(),
        id:            step.id || null,
        text:          step.text || "",
        note:          step.note || "",
        thenWait:      step.then_wait ?? null,
        min:           step.wait_min ?? step.then_wait ?? 0,
        max:           step.wait_max ?? step.then_wait ?? 0,
        handsOn:       step.active_seconds === null || step.active_seconds === undefined ? "" : String(Math.round(step.active_seconds / 60)),
        needsPresence: step.needs_presence ?? null,
        warnings:      step.warnings || []
    }
}


// A blank step to add
export function blankStep() {
    return formStep({ text: "", then_wait: 0, wait_min: 0, wait_max: 0 })
}


export function recipeForm(recipe) {
    return {
        name:          recipe.name || "",
        author:        recipe.author || "",
        source:        recipe.source || "",
        url:           recipe.url || "",
        difficulty:    recipe.difficulty || "Beginner",
        detailLevel:   recipe.detail_level || "simple",
        category:      recipe.category || "bread",
        prerequisites: recipe.prerequisite_ids || (recipe.prerequisites || []).map((prereq) => prereq.id),
        steps:         (recipe.steps || []).map(formStep)
    }
}


// Changes a step's Then Wait. A step without a range (min = max = Then Wait) keeps having none, so a
// Simple recipe never ends up with a hidden range its Then Wait sits outside of.
export function withThenWait(step, seconds) {
    const noRange = step.min === step.max && (step.thenWait === null || step.thenWait === step.min)
    return noRange ? { ...step, thenWait: seconds, min: seconds, max: seconds } : { ...step, thenWait: seconds }
}


const blankToNull = (text) => (text.trim() ? text.trim() : null)


// Hands-on minutes as seconds: blank is unknown (null); anything else must be a whole number
export function handsOnSeconds(text) {
    if (!text.trim()) return null
    const minutes = Number(text)
    return Number.isInteger(minutes) && minutes >= 0 ? minutes * 60 : NaN
}


// The full PUT/POST body. Drafts stay drafts; publishing (PR 2) takes them live.
export function formBody(form, isDraft = false) {
    return {
        name:          form.name.trim(),
        author:        blankToNull(form.author),
        source:        blankToNull(form.source),
        url:           blankToNull(form.url),
        difficulty:    form.difficulty,
        detail_level:  form.detailLevel,
        is_draft:      isDraft,
        category:      form.category,
        prerequisites: form.category === "prep" ? [] : form.prerequisites,
        steps:         form.steps.map((step) => ({
            id:             step.id,
            text:           step.text.trim(),
            note:           blankToNull(step.note),
            then_wait:      step.thenWait,
            wait_min:       step.min,
            wait_max:       step.max,
            active_seconds: handsOnSeconds(step.handsOn),
            needs_presence: step.needsPresence
        }))
    }
}


// Problems the browser can catch before saving, keyed like the API's `fields`. Drafts can leave the name
// and step text blank, as the API allows.
export function formProblems(form, { draft = false } = {}) {
    const problems = {}
    if (!form.name.trim() && !draft) problems.name = "Give the recipe a name."
    form.steps.forEach((step, i) => {
        if (!step.text.trim() && !draft) problems[`steps[${i}].text`] = "Describe the step."
        if (step.min > step.max) problems[`steps[${i}].wait_max`] = "Can't be shorter than the minimum wait."
        if (Number.isNaN(handsOnSeconds(step.handsOn))) problems[`steps[${i}].active_seconds`] = "Enter whole minutes, or leave it blank if unknown."
    })
    return problems
}


// The API's step warnings, worded for people
export const WARNING_TEXT = {
    then_wait_outside_range:  "Then Wait is outside its range.",
    hands_on_longer_than_wait: "Hands-on time is longer than the wait, so it overlaps the next step."
}
