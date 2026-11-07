// User-facing recipe URLs (see "URLs" in the Second Rise spec):
//   defaults use a pure slug:          /recipes/country-sourdough
//   personal recipes add a suffix:     /recipes/country-sourdough-k7qx2m
// The API only ever sees internal ids, slugs, or suffixes; it builds each recipe's `path` itself.

const SUFFIX_PATTERN = /-([a-z0-9]{6})$/


// The public suffix at the end of a recipe path segment, or null when it can't have one
export function suffixFromRecipePath(recipePath = "") {
    const match = SUFFIX_PATTERN.exec(recipePath)
    return match ? match[1] : null
}


// Converts a v2 recipe into the shape the plan view (RecipePage) already uses.
// v2 doesn't store plan-view state, so the plan starts now and solves for the finish time.
export function v2RecipeToPlan(recipe, now = Date.now()) {
    return {
        id:              recipe.id,
        name:            recipe.name,
        author:          recipe.author || "",
        source:          recipe.source || "",
        url:             recipe.url || "",
        difficulty:      recipe.difficulty,
        length:          recipe.length_seconds || 0,
        solve_for_start: true,
        start_time:      now,
        steps:           (recipe.steps || []).map((step) => ({
            step_id:   step.id,
            number:    step.position,
            text:      step.text,
            then_wait: step.then_wait ?? 0,
            note:      step.note || ""
        }))
    }
}
