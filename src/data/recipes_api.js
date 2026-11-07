// v2 recipe reads. Results use apiCall's { ok, status, data } / { ok: false, status, code, message } shape.
import { apiCall } from "./api_call"
import { breadsheetApis } from "./endpoints"
import { suffixFromRecipePath } from "../helpers/recipe_paths"


// Defaults plus the signed-in user's personal recipes; data is { recipes }
export function listRecipes() {
    return apiCall(breadsheetApis.recipesV2.all)
}


// Resolves the last segment of a /recipes/<...> URL to a recipe; data is { recipe }.
// Defaults are pure slugs, so the slug lookup goes first: a default can never be mistaken for a
// personal recipe. Only when that misses, and the segment ends in a suffix, is the suffix tried.
export async function resolveRecipePath(recipePath) {
    const segment = recipePath.toLowerCase()

    const bySlug = await apiCall(`${breadsheetApis.recipesV2.bySlug}/${encodeURIComponent(segment)}`)
    if (bySlug.ok || bySlug.status !== 404) return bySlug

    const suffix = suffixFromRecipePath(segment)
    if (!suffix) return bySlug

    return apiCall(`${breadsheetApis.recipesV2.bySuffix}/${suffix}`)
}
