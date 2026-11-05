import React, { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { downloadKeyFile, keyLinkUrl } from "../../helpers/identity"


// Shown once, right after registering: the key as text, a QR code, and a link. Continue unlocks only
// after the key is copied, downloaded, or confirmed saved, since it can never be shown again.
export default function SaveKey({ username, secretKey, onContinue }) {
    const [ copied, setCopied ] = useState(false)
    const [ downloaded, setDownloaded ] = useState(false)
    const [ confirmed, setConfirmed ] = useState(false)
    const link = keyLinkUrl(secretKey)

    // Copy the key; older browsers without the Clipboard API can still select it by hand
    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(secretKey)
            setCopied(true)
        } catch {
            setCopied(false)
        }
    }

    function handleDownload() {
        downloadKeyFile(username, secretKey)
        setDownloaded(true)
    }

    const canContinue = copied || downloaded || confirmed

    return (
        <section className="identity-page save-key">
            <h2 className="identity-heading">Save your key, {username}</h2>

            <p className="identity-warning">
                <strong>This key is the only way back into your account.</strong> There's no password reset,
                and Breadsheet can't show it to you again.
            </p>

            <div className="save-key-value">
                <code className="key-text" aria-label="Your key">{secretKey}</code>
                <button type="button" className="btn btn-default" onClick={handleCopy}>
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>

            <div className="save-key-qr">
                <QRCodeSVG value={link} size={168} marginSize={2} title="QR code for your sign-in link" />
                <p className="identity-hint">
                    Scan this on your phone to sign in there, or save a screenshot of it.
                </p>
            </div>

            <p className="identity-hint">
                Sign-in link: <span className="key-link">{link}</span>
            </p>

            <div className="save-key-actions">
                <button type="button" className="btn btn-default" onClick={handleDownload}>
                    {downloaded ? "Downloaded" : "Download"}
                </button>

                <label className="identity-checkbox">
                    <input type="checkbox"
                           checked={confirmed}
                           onChange={(event) => setConfirmed(event.target.checked)} />
                    I've saved my key somewhere safe
                </label>
            </div>

            <button type="button"
                    className="btn btn-primary"
                    disabled={!canContinue}
                    onClick={onContinue}>
                Continue
            </button>
            {!canContinue && <p className="identity-hint">Copy, download, or save your key to continue.</p>}
        </section>
    )
}
