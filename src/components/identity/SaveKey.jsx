import React, { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { downloadKeyFile, keyLinkUrl } from "../../helpers/identity"


// Shown once, right after registering: the key as text, a QR code, and a link. Continue unlocks only
// after the key is copied, downloaded, or confirmed saved, since it can never be shown again.
// With `handover` (breadsheet-ui#66), an admin who just reset someone's key sees it to pass on instead.
export default function SaveKey({ username, secretKey, onContinue, handover = false }) {
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
            <h2 className="identity-heading">{handover ? `New key for ${username}` : `Save your key, ${username}`}</h2>

            {handover ?
                <p className="identity-warning">
                    <strong>Give this key to {username} privately.</strong> Their old key no longer works, they're
                    signed out everywhere, and Breadsheet can't show this key again.
                </p> :
                <p className="identity-warning">
                    <strong>This key is the only way back into your account.</strong> There's no password reset,
                    and Breadsheet can't show it to you again.
                </p>}

            <div className="save-key-value">
                <code className="key-text" aria-label={handover ? `${username}'s key` : "Your key"}>{secretKey}</code>
                <button type="button" className="btn btn-default" onClick={handleCopy}>
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>

            <div className="save-key-qr">
                <QRCodeSVG value={link} size={168} marginSize={2}
                           title={handover ? `QR code for ${username}'s sign-in link` : "QR code for your sign-in link"} />
                <p className="identity-hint">
                    {handover ? `${username} can scan this with their phone to sign in there.` :
                        "Scan this on your phone to sign in there, or save a screenshot of it."}
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
                    {handover ? "I've passed this key on" : "I've saved my key somewhere safe"}
                </label>
            </div>

            <button type="button"
                    className="btn btn-primary"
                    disabled={!canContinue}
                    onClick={onContinue}>
                {handover ? "Done" : "Continue"}
            </button>
            {!canContinue && <p className="identity-hint">
                {handover ? "Copy, download, or pass on the key to finish." : "Copy, download, or save your key to continue."}
            </p>}
        </section>
    )
}
