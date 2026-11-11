import React, { useCallback, useEffect, useState } from "react"
import { createPairingCode, listConnections, renameConnection, revokeConnection } from "../../data/connections_api"

// While a pairing code is showing, how often to look for the new connection
export const PAIRING_POLL_MS = 5000

// The server's limit on a connection's name (breadsheet#97)
const MAX_LABEL = 60


// "9:05" for 545 seconds left
function countdown(ms) {
    const seconds = Math.max(0, Math.ceil(ms / 1000))
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}


function day(iso) {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}


// What the server will save: trimmed, with runs of spaces made one
function cleanLabel(text) {
    return text.split(/\s+/).filter(Boolean).join(" ")
}


// Whether two connections would look the same in the list
function hasDuplicateNames(connections) {
    const names = connections.map((connection) => connection.label.toLowerCase())
    return new Set(names).size < names.length
}


// Rename one connection inline (breadsheet-ui#73). Enter saves, Escape cancels. A connection revoked in another tab
// (404) is passed to onGone, so the list drops it.
function FormRenameConnection({ connection, onRenamed, onGone, onCancel }) {
    const [ text, setText ] = useState(connection.label)
    const [ saving, setSaving ] = useState(false)
    const [ error, setError ] = useState(null)
    const label = cleanLabel(text)

    async function save(event) {
        event.preventDefault()
        setSaving(true)
        setError(null)
        const result = await renameConnection(connection.id, label)
        setSaving(false)
        if (result.ok) onRenamed(result.data.connection)
        else if (result.status === 404) onGone(connection.id)
        else setError(result.message)
    }

    return (
        <form className="connection-rename" onSubmit={save} noValidate>
            <label className="sr-only" htmlFor={`rename-${connection.id}`}>New name for {connection.label}</label>
            <input id={`rename-${connection.id}`}
                   type="text"
                   value={text}
                   maxLength={MAX_LABEL}
                   autoFocus={true}
                   onChange={(event) => setText(event.target.value)}
                   onKeyDown={(event) => { if (event.key === "Escape") onCancel() }} />
            <div className="pairing-actions">
                <button type="submit" className="btn btn-primary"
                        disabled={saving || !label || label === connection.label}>
                    {saving ? "Saving…" : "Save"}
                </button>
                <button type="button" className="btn btn-default" onClick={onCancel}>Cancel</button>
            </div>
            {error && <p className="identity-error" role="alert">{error}</p>}
        </form>
    )
}


// The Home Assistant section of /profile (breadsheet-ui#29): get a pairing code, and list, rename (breadsheet-ui#73)
// and revoke connections. The id is the target for "pair Home Assistant first" links (breadsheet-ui#40).
export default function HomeAssistant() {
    const [ connections, setConnections ] = useState(null)  // null until the first load
    const [ loadError, setLoadError ] = useState(null)

    // The code on screen: { code, expiresAt (ms), knownIds (connections that existed before it) }
    const [ pairing, setPairing ] = useState(null)
    const [ now, setNow ] = useState(() => Date.now())
    const [ requesting, setRequesting ] = useState(false)
    const [ codeError, setCodeError ] = useState(null)
    const [ copied, setCopied ] = useState(false)
    const [ pairedLabel, setPairedLabel ] = useState(null)

    const [ confirming, setConfirming ] = useState(null)  // the connection id awaiting confirmation
    const [ revoking, setRevoking ] = useState(false)
    const [ revokeError, setRevokeError ] = useState(null)
    const [ renaming, setRenaming ] = useState(null)  // the connection id being renamed; one row at a time

    // Replaces a renamed connection in the list
    function renamed(updated) {
        setConnections((current) => current.map((connection) => connection.id === updated.id ? updated : connection))
        setRenaming(null)
    }

    // Drops a connection that's already gone (revoked in another tab)
    function gone(id) {
        setConnections((current) => current.filter((connection) => connection.id !== id))
        setRenaming(null)
        setConfirming(null)
    }

    const load = useCallback(async () => {
        const result = await listConnections()
        if (!result.ok) {
            setLoadError(result.message)
            return null
        }
        setLoadError(null)
        setConnections(result.data.connections)
        return result.data.connections
    }, [])

    useEffect(() => { load() }, [ load ])

    // "Pair Home Assistant" links from the bake pages land here (/profile#home-assistant). The router doesn't
    // scroll to fragments, so this does.
    useEffect(() => {
        if (window.location.hash === "#home-assistant") {
            document.getElementById("home-assistant")?.scrollIntoView?.({ block: "start" })
        }
    }, [])

    const live = pairing !== null && now < pairing.expiresAt

    // The countdown
    useEffect(() => {
        if (!pairing) return
        const timer = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(timer)
    }, [ pairing ])

    // While the code is live, watch for Home Assistant to use it
    useEffect(() => {
        if (!live) return
        const timer = setInterval(async () => {
            const found = (await load())?.find((connection) => !pairing.knownIds.has(connection.id))
            if (found) {
                setPairedLabel(found.label)
                setPairing(null)
            }
        }, PAIRING_POLL_MS)
        return () => clearInterval(timer)
    }, [ live, pairing, load ])

    async function getCode() {
        setRequesting(true)
        setCodeError(null)
        setPairedLabel(null)
        setCopied(false)
        const result = await createPairingCode()
        setRequesting(false)
        if (!result.ok) {
            setCodeError(result.message)
            return
        }
        setNow(Date.now())
        setPairing({
            code:      result.data.code,
            expiresAt: Date.parse(result.data.expires_at),
            knownIds:  new Set((connections || []).map((connection) => connection.id))
        })
    }

    async function copyCode() {
        try {
            await navigator.clipboard.writeText(pairing.code)
            setCopied(true)
        } catch {
            // Clipboard blocked: the code is on screen to type instead
        }
    }

    async function revoke(id) {
        setRevoking(true)
        setRevokeError(null)
        const result = await revokeConnection(id)
        setRevoking(false)
        // 404: already revoked (maybe in another tab), so it's gone either way
        if (result.ok || result.status === 404) {
            gone(id)
            return
        }
        setRevokeError(result.message)
    }

    return (
        <section id="home-assistant" className="home-assistant" aria-labelledby="home-assistant-heading">
            <h2 id="home-assistant-heading" className="identity-subheading">
                Home Assistant
            </h2>
            <p>
                <a href="https://github.com/brystmar/breadsheet-hass#readme">Pair with Home Assistant</a> to get live step alerts on your phone's lock screen.
            </p>

            {pairedLabel && <p className="pairing-success" role="status">✓ Paired with {pairedLabel}</p>}

            {pairing && live && (
                <div className="pairing-code-card">
                    <p className="pairing-code" aria-label={`Pairing code ${pairing.code.split("").join(" ")}`}>
                        {pairing.code}
                    </p>
                    <div className="pairing-actions">
                        <button type="button" className="btn btn-default" onClick={copyCode}>
                            {copied ? "Copied" : "Copy"}
                        </button>
                        <span className="identity-hint" aria-live="off">
                            Expires in {countdown(pairing.expiresAt - now)}
                        </span>
                    </div>
                    <p className="identity-hint">Works once. Getting a new code replaces this one.</p>
                </div>
            )}

            {pairing && !live && <p className="identity-error" role="status">This code expired.</p>}

            {codeError && <p className="identity-error" role="alert">{codeError}</p>}

            <button type="button" className="btn btn-primary" onClick={getCode} disabled={requesting}>
                {requesting ? "Getting a code…" : pairing ? "Get a new code" : "Get a pairing code"}
            </button>

            <h3 className="connections-heading">Connections</h3>
            {loadError && (
                <p className="identity-error" role="alert">
                    {loadError} <button type="button" className="btn btn-default" onClick={load}>Try again</button>
                </p>
            )}
            {connections && connections.length === 0 && (
                <p className="identity-hint">No Home Assistant connected yet.</p>
            )}
            {connections && connections.length > 0 && (
                <ul className="connections-list">
                    {connections.map((connection) => (
                        <li key={connection.id} className="connection">
                            <div className="connection-details">
                                {renaming === connection.id ?
                                    <FormRenameConnection connection={connection}
                                                          onRenamed={renamed}
                                                          onGone={gone}
                                                          onCancel={() => setRenaming(null)} /> :
                                    <strong>{connection.label}</strong>}
                                <span className="identity-hint">
                                    Paired {day(connection.created_at)} ·{" "}
                                    {connection.last_used_at ? `Last used ${day(connection.last_used_at)}` : "Not used yet"}
                                </span>
                            </div>
                            {renaming === connection.id ? null : confirming === connection.id ? (
                                <div className="edit-confirm" role="alertdialog" aria-labelledby={`revoke-${connection.id}`}>
                                    <p id={`revoke-${connection.id}`}>
                                        Revoke {connection.label}? Home Assistant loses access right away, along with
                                        any AI assistants connected through it.
                                    </p>
                                    {revokeError && <p className="identity-error" role="alert">{revokeError}</p>}
                                    <div className="pairing-actions">
                                        <button type="button" className="btn btn-default" onClick={() => setConfirming(null)}>
                                            Keep it
                                        </button>
                                        <button type="button" className="btn btn-danger" disabled={revoking}
                                                onClick={() => revoke(connection.id)}>
                                            {revoking ? "Revoking…" : "Revoke"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="pairing-actions">
                                    <button type="button" className="btn btn-default"
                                            onClick={() => { setRenaming(connection.id); setConfirming(null) }}>
                                        Rename
                                    </button>
                                    <button type="button" className="btn btn-danger"
                                            onClick={() => { setConfirming(connection.id); setRenaming(null); setRevokeError(null) }}>
                                        Revoke
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            {connections && hasDuplicateNames(connections) && (
                <p className="identity-hint">Two connections have the same name. Rename one to tell them apart.</p>
            )}
        </section>
    )
}
