// Sends a v2 API request and normalizes the result to { ok, status, data } on success or
// { ok: false, status, code, message, retryAfter, fields } on failure, using the API's error codes.
// `fields` maps request fields (e.g. "steps[2].text") to what's wrong with each, when the API says.
// Network failures become code "network_error".
import { apiFetch } from "./api_fetch"


// Sends a request and normalizes the result
export async function apiCall(url, options = {}) {
    let response
    try {
        response = await apiFetch(url, options)
    } catch {
        return { ok: false, status: 0, code: "network_error",
                 message: "Breadsheet can't be reached right now. Check your connection and try again." }
    }

    if (response.status === 204) return { ok: true, status: 204, data: null }

    let body = null
    try {
        body = await response.json()
    } catch {
        // Some failures (e.g. from a proxy) have no JSON body
    }

    if (response.ok) return { ok: true, status: response.status, data: body }

    const retryAfter = Number(response.headers?.get?.("Retry-After")) || null
    return {
        ok:      false,
        status:  response.status,
        code:    body?.code || "http_error",
        message: body?.message || "Something went wrong. Please try again.",
        retryAfter,
        fields:  body?.fields || null
    }
}
