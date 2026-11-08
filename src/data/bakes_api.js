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
