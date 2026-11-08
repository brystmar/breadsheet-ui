import { blankStep, formBody, formProblems, formStep, handsOnSeconds, recipeForm, withThenWait } from "./recipe_form"

const HOUR = 3600


describe("recipe form", () => {
    test("reads hands-on time as minutes; blank is unknown", () => {
        expect(handsOnSeconds("")).toBeNull()
        expect(handsOnSeconds(" 15 ")).toBe(900)
        expect(handsOnSeconds("0")).toBe(0)
        expect(handsOnSeconds("1.5")).toBeNaN()
        expect(handsOnSeconds("-2")).toBeNaN()
    })

    test("a Then Wait change carries a step without a range along, but leaves a range alone", () => {
        const fixed = formStep({ id: "a", text: "Mix", then_wait: 900, wait_min: 900, wait_max: 900 })
        expect(withThenWait(fixed, 1200)).toMatchObject({ thenWait: 1200, min: 1200, max: 1200 })
        const ranged = formStep({ id: "b", text: "Rise", then_wait: 2 * HOUR, wait_min: HOUR, wait_max: 3 * HOUR })
        expect(withThenWait(ranged, 4 * HOUR)).toMatchObject({ thenWait: 4 * HOUR, min: HOUR, max: 3 * HOUR })
    })

    test("round-trips a recipe to a full body, with blanks as null", () => {
        const recipe = {
            name: " Loaf ", author: "", source: "Book", url: null, difficulty: "Expert", detail_level: "detailed",
            category: "bread", prerequisite_ids: [ "p1" ],
            steps: [ { id: "s1", text: "Mix", note: "", then_wait: null, wait_min: HOUR, wait_max: 2 * HOUR,
                       active_seconds: 600, needs_presence: false } ]
        }
        expect(formBody(recipeForm(recipe), true)).toEqual({
            name: "Loaf", author: null, source: "Book", url: null, difficulty: "Expert", detail_level: "detailed",
            is_draft: true, category: "bread", prerequisites: [ "p1" ],
            steps: [ { id: "s1", text: "Mix", note: null, then_wait: null, wait_min: HOUR, wait_max: 2 * HOUR,
                       active_seconds: 600, needs_presence: false } ]
        })
    })

    test("prep recipes send no prerequisites", () => {
        const form = { ...recipeForm({ name: "Starter", category: "prep", prerequisite_ids: [ "p1" ], steps: [] }) }
        expect(formBody(form).prerequisites).toEqual([])
    })

    test("flags what the API would refuse", () => {
        const form = recipeForm({ name: "", steps: [] })
        form.steps = [ { ...blankStep(), min: 600, max: 300, handsOn: "x" } ]
        expect(formProblems(form)).toEqual({
            name: "Give the recipe a name.",
            "steps[0].text": "Describe the step.",
            "steps[0].wait_max": "Can't be shorter than the minimum wait.",
            "steps[0].active_seconds": "Enter whole minutes, or leave it blank if unknown."
        })
    })
})
