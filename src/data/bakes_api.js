// v2 bakes. Results use apiCall's { ok, status, data } / { ok: false, status, code, message } shape.
import { apiCall } from "./api_call"
import { breadsheetApis } from "./endpoints"


// Starts a bake; data is { bake }. The same `idempotencyKey` on a retry returns the original bake.
export function startBake(body, idempotencyKey) {
    return apiCall(breadsheetApis.bakes.all, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body:    JSON.stringify(body)
    })
}


// The signed-in user's bake at /bakes/<suffix>; data is { bake }
export function bakeBySuffix(suffix) {
    return apiCall(`${breadsheetApis.bakes.bySuffix}/${encodeURIComponent(suffix)}`)
}


// A new idempotency key for one Start bake attempt
export function newIdempotencyKey() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}


const JSON_POST = { method: "POST", headers: { "Content-Type": "application/json" } }

// Checks off a step at `completedAt` (ISO); first write wins, so retries are safe. data is { bake }.
export function completeStep(bakeId, position, completedAt) {
    return apiCall(`${breadsheetApis.bakes.all}/${bakeId}/steps/${position}/complete`,
                   { ...JSON_POST, body: JSON.stringify({ completed_at: completedAt }) })
}


// Skips a step at `skippedAt` (ISO); first write wins. data is { bake }.
export function skipStep(bakeId, position, skippedAt) {
    return apiCall(`${breadsheetApis.bakes.all}/${bakeId}/steps/${position}/skip`,
                   { ...JSON_POST, body: JSON.stringify({ skipped_at: skippedAt }) })
}


// Finishes a bake now, checking off any steps left; data is { bake }
export function completeBake(bakeId, completedAt) {
    return apiCall(`${breadsheetApis.bakes.all}/${bakeId}/complete`,
                   { ...JSON_POST, body: JSON.stringify({ completed_at: completedAt }) })
}


// Changes a bake's alert mode ("simple" or "fancy"); data is { bake }. Fancy without a paired Home Assistant is
// 409 fancy_requires_ha.
export function changeAlertMode(bakeId, alertMode) {
    return apiCall(`${breadsheetApis.bakes.all}/${bakeId}`,
                   { method: "PATCH", headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({ alert_mode: alertMode }) })
}


// Ends a bake without finishing it; data is { bake }
export function cancelBake(bakeId) {
    return apiCall(`${breadsheetApis.bakes.all}/${bakeId}/cancel`, { ...JSON_POST, body: "{}" })
}


// One of the signed-in user's bakes by internal id; data is { bake }
export function getBake(bakeId) {
    return apiCall(`${breadsheetApis.bakes.all}/${bakeId}`)
}


// The signed-in user's active bakes (up to three), with schedules; data is { bakes }
export function listActiveBakes() {
    return apiCall(breadsheetApis.bakes.all)
}


// Records that a bake's schedule was downloaded as calendar events, for usage metrics (breadsheet#34).
// The export happens entirely in the browser, so this is the only way the server hears of it. Best effort:
// a failure is ignored and never gets in the baker's way.
export function recordIcsExport(bake) {
    return apiCall(breadsheetApis.events, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type: "ics_exported", bake_id: bake.id })
    }).catch(() => null)
}
