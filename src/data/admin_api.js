// Admin users and metrics (/api/v2/admin/users and /api/v2/admin/metrics, breadsheet#87).
// Results use apiCall's { ok, status, data } / { ok: false, status, code, message } shape.
import { apiCall } from "./api_call"
import { breadsheetApis } from "./endpoints"


// Users, newest first; data is { users: [admin user] }. Filters: q, active (true), hideTests (true).
export function listUsers({ q = "", active = false, hideTests = false } = {}) {
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (active) params.set("active", "1")
    if (hideTests) params.set("tests", "0")
    const query = params.toString()
    return apiCall(`${breadsheetApis.adminUsers}${query ? `?${query}` : ""}`)
}


// A new key for someone else, shown once; data is { user, key }. Never log the result.
export function resetUserKey(userId) {
    return apiCall(`${breadsheetApis.adminUsers}/${encodeURIComponent(userId)}/key`, { method: "POST" })
}


// Rename a user; data is { user }
export function renameUser(userId, username) {
    return apiCall(`${breadsheetApis.adminUsers}/${encodeURIComponent(userId)}`, {
        method: "PATCH", body: JSON.stringify({ username })
    })
}


// The usage metrics; data is { metrics: [{ name, question, rows }] }
export function getMetrics() {
    return apiCall(breadsheetApis.adminMetrics)
}
