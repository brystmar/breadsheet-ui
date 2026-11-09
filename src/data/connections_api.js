// Home Assistant pairing codes and connections (/api/v2/pairing-codes and /api/v2/connections, breadsheet#27).
// Every call resolves to { ok, status, data } on success or { ok: false, status, code, message } on failure.
import { apiCall as call } from "./api_call"
import { breadsheetApis } from "./endpoints"


// A new pairing code for this user, good for ten minutes; data is { code: "XXXX-XXXX", expires_at }.
// Any earlier unused code stops working.
export function createPairingCode() {
    return call(breadsheetApis.pairingCodes, { method: "POST" })
}


// Paired Home Assistant instances, newest first; data is { connections: [{ id, label, scopes, created_at, last_used_at }] }
export function listConnections() {
    return call(breadsheetApis.connections)
}


// Revokes a connection: 204 (data null), or 404 not_found when it's already gone
export function revokeConnection(id) {
    return call(`${breadsheetApis.connections}/${encodeURIComponent(id)}`, { method: "DELETE" })
}
