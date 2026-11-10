// Home Assistant's sidebar panel (breadsheet-hass#5) shows the bake view in a frame, where breadsheet's session
// cookie isn't sent. Home Assistant passes a short-lived panel token in the page's fragment instead; it lives
// here, in memory only (never localStorage, a URL path or query, or the console), and apiFetch sends it as a
// bearer token. It works for bakes only and expires after 12 hours.
let token = null


export function setPanelToken(value) {
    token = value || null
}


export function panelToken() {
    return token
}


// Reads the token from #t=<token> and removes the fragment from the address bar and history.
// Returns whether a token is set (from this URL or an earlier one in this page's life).
export function takePanelTokenFromUrl() {
    const value = new URLSearchParams(window.location.hash.slice(1)).get("t")
    if (value) {
        setPanelToken(value)
        window.history.replaceState(window.history.state, "", window.location.pathname)
    }
    return token !== null
}
