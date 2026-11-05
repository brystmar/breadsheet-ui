// Usernames and keys for signup and sign-in (breadsheet#26 is the server side).
// The key is the user's only credential: keep it in component state only. Never put it in
// localStorage, a URL path, a query string, or the console.

// Same rules as the server; it also blocks reserved names and has the final say
const USERNAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{2,29}$/

export const USERNAME_RULES = "3 to 30 characters: letters, numbers, underscores, and hyphens, " +
    "starting with a letter or number."


// Why this username can't be used, or null when it looks fine
export function usernameProblem(username) {
    return USERNAME_PATTERN.test(username.trim()) ? null : `Usernames are ${USERNAME_RULES}`
}


// The key link for another device. The key goes after "#", which browsers never send to any server.
export function keyLinkUrl(key, origin = window.location.origin) {
    return `${origin}/k#${key}`
}


// The key from a key link's fragment (e.g. "#abc123"), or null
export function keyFromHash(hash) {
    const key = decodeURIComponent((hash || "").replace(/^#/, "")).trim()
    return key || null
}


// Downloads a small text file with the key and its link, for keeping somewhere safe
export function downloadKeyFile(username, key) {
    const text = [
        `Breadsheet key for ${username}`,
        "",
        `Key: ${key}`,
        `Sign-in link: ${keyLinkUrl(key)}`,
        "",
        "This key is the only way back into your account. There's no password reset.",
        "Open the link (or paste the key at /signin) on any device to sign in there.",
        ""
    ].join("\n")

    const url = URL.createObjectURL(new Blob([ text ], { type: "text/plain" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `breadsheet-key-${username}.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}


// A rate-limit wait in words, e.g. "about 14 minutes"
export function describeWait(seconds) {
    if (!seconds) return "a little while"
    const minutes = Math.ceil(seconds / 60)
    return minutes <= 1 ? "about a minute" : `about ${minutes} minutes`
}
