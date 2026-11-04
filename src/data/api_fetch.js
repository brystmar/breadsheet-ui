// fetch() for breadsheet API calls. The API lives on a different origin (api.breadsheet.com), so
// browsers only send cookies (like the upcoming session cookie) when credentials are included.
// The backend allows this for breadsheet.com origins only. Credentials are always included, even
// if a caller passes something else, so no API call can quietly go out without them.
export function apiFetch(url, options = {}) {
    return fetch(url, { ...options, credentials: "include" })
}
