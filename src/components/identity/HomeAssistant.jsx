import React, { useCallback, useEffect, useState } from "react"
import { createPairingCode, listConnections, revokeConnection } from "../../data/connections_api"

// While a pairing code is showing, how often to look for the new connection
export const PAIRING_POLL_MS = 5000


// "9:05" for 545 seconds left
function countdown(ms) {
    const seconds = Math.max(0, Math.ceil(ms / 1000))
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}


function day(iso) {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}


// The Home Assistant section of /profile (breadsheet-ui#29): get a pairing code, and list and revoke
// connections. The id is the target for "pair Home Assistant first" links (breadsheet-ui#40).
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
            setConnections((current) => current.filter((connection) => connection.id !== id))
            setConfirming(null)
            return
        }
        setRevokeError(result.message)
    }

    return (
        <section id="home-assistant" className="home-assistant" aria-labelledby="home-assistant-heading">
            <h3 id="home-assistant-heading" className="identity-subheading">
                Home Assistant
            </h3>
            <p>
                Pair Home Assistant to get bake alerts on your phone. In Home Assistant, add the Breadsheet
                integration from the Marketplace and enter a pairing code from here
                (<a href="https://github.com/brystmar/breadsheet-hass#readme">setup guide</a>).
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

            <h4 className="connections-heading">Connections</h4>
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
                                <strong>{connection.label}</strong>
                                <span className="identity-hint">
                                    Paired {day(connection.created_at)} ·{" "}
                                    {connection.last_used_at ? `Last used ${day(connection.last_used_at)}` : "Not used yet"}
                                </span>
                            </div>
                            {confirming === connection.id ? (
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
                                        <button type="button" className="btn connection-revoke" disabled={revoking}
                                                onClick={() => revoke(connection.id)}>
                                            {revoking ? "Revoking…" : "Revoke"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button type="button" className="btn btn-default"
                                        onClick={() => { setConfirming(connection.id); setRevokeError(null) }}>
                                    Revoke
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
