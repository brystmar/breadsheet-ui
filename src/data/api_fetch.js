import { panelToken } from "./panel_token"


// fetch() for breadsheet API calls. The API lives on a different origin (api.breadsheet.com), so
// browsers only send cookies (like the upcoming session cookie) when credentials are included.
// The backend allows this for breadsheet.com origins only. Credentials are always included, even
// if a caller passes something else, so no API call can quietly go out without them.
export function apiFetch(url, options = {}) {
    // Inside Home Assistant's panel there's no cookie, so the panel token stands in (see panel_token.js)
    const token = panelToken()
    const headers = token ? { ...(options.headers || {}), Authorization: `Bearer ${token}` } : options.headers
    return fetch(url, { ...options, ...(headers ? { headers } : {}), credentials: "include" })
}
