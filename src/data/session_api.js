// Registration and browser sessions (/api/v2/users and /api/v2/session).
// Every call resolves to { ok, status, data } on success or { ok: false, status, code, message } on
// failure, using the API's error codes; network failures become code "network_error".
// Never log what these return: registration responses contain the user's key.
import { apiCall as call } from "./api_call"
import { breadsheetApis } from "./endpoints"

const JSON_HEADERS = { "Content-Type": "application/json" }


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
