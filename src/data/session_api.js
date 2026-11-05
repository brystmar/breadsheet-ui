// Signup and browser sessions (/api/v2/users and /api/v2/session).
// Every call resolves to { ok, status, data } on success or { ok: false, status, code, message } on
// failure, using the API's error codes; network failures become code "network_error".
// Never log what these return: signup responses contain the user's key.
import { apiFetch } from "./api_fetch"
import { breadsheetApis } from "./endpoints"

const JSON_HEADERS = { "Content-Type": "application/json" }


// Sends a request and normalizes the result
async function call(url, options = {}) {
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
        retryAfter
    }
}


// Creates a user and signs this browser in; data is { user, key }
export function signUp(username) {
    return call(breadsheetApis.users, {
        method:  "POST",
        headers: JSON_HEADERS,
        body:    JSON.stringify({ username })
    })
}


// Exchanges a key for a session cookie; data is { user }
export function signIn(key) {
    return call(breadsheetApis.session, {
        method:  "POST",
        headers: JSON_HEADERS,
        body:    JSON.stringify({ key })
    })
}


// The signed-in user (data is { user }), or a 401 with code "not_signed_in"
export function getSession() {
    return call(breadsheetApis.session)
}


// Signs this browser out (other browsers stay signed in)
export function signOut() {
    return call(breadsheetApis.session, { method: "DELETE", headers: JSON_HEADERS })
}
