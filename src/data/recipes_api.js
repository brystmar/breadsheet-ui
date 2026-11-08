// v2 recipe reads. Results use apiCall's { ok, status, data } / { ok: false, status, code, message } shape.
import { apiCall } from "./api_call"
import { breadsheetApis } from "./endpoints"
import { suffixFromRecipePath } from "../helpers/recipe_paths"

const JSON_HEADERS = { "Content-Type": "application/json" }


// "?q=rye&category=bread", leaving out what's blank
function listQuery({ q = "", category = "" } = {}) {
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (category) params.set("category", category)
    const query = params.toString()
    return query ? `?${query}` : ""
}


// Defaults plus the signed-in user's personal recipes (drafts included), optionally filtered by name
// and category; data is { recipes }
export function listRecipes(filters) {
    return apiCall(`${breadsheetApis.recipesV2.all}${listQuery(filters)}`)
}


// Published community recipes for everyone, newest first, optionally filtered; data is { recipes }
export function listCommunityRecipes(filters) {
    return apiCall(`${breadsheetApis.recipesV2.community}${listQuery(filters)}`)
}


// The prep recipes the user can see (defaults plus their own), for picking prerequisites; data is { recipes }
export function listPrepRecipes() {
    return apiCall(`${breadsheetApis.recipesV2.all}?category=prep`)
}


// Deletes one of the user's own recipes; their bakes from it keep running from their copies
export function deleteRecipe(recipeId) {
    return apiCall(`${breadsheetApis.recipesV2.all}/${recipeId}`, { method: "DELETE" })
}


// Creates a personal recipe from scratch (a draft when `is_draft`); data is { recipe }
export function createRecipe(body) {
    return apiCall(breadsheetApis.recipesV2.all, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(body) })
}


// Shares one of the user's own recipes in the community library; it must pass validation. data is { recipe }
export function publishRecipe(recipeId) {
    return apiCall(`${breadsheetApis.recipesV2.all}/${recipeId}/publish`, { method: "POST", headers: JSON_HEADERS })
}


// Takes a recipe out of the community library; copies already made are unaffected. Answers 204, no body.
export function unpublishRecipe(recipeId) {
    return apiCall(`${breadsheetApis.recipesV2.all}/${recipeId}/publish`, { method: "DELETE" })
}


// Replaces one of the user's own recipes with `body` (the full recipe); data is { recipe }
export function updateRecipe(recipeId, body) {
    return apiCall(`${breadsheetApis.recipesV2.all}/${recipeId}`, {
        method:  "PUT",
        headers: JSON_HEADERS,
        body:    JSON.stringify(body)
    })
}


// Copies any recipe the user can see into a new personal recipe ("Make it mine"); data is { recipe }
export function copyRecipe(recipeId) {
    return apiCall(`${breadsheetApis.recipesV2.all}/${recipeId}/copy`, { method: "POST", headers: JSON_HEADERS })
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
