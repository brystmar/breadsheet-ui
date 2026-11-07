import React from "react"
import { Link } from "react-router"
import useSession from "../../hooks/useSession"


// /devices: how to sign in on another phone or computer. The key is never shown again after
// registration, so this explains the options instead of displaying it.
export default function LinkDevice() {
    const { user } = useSession()

    return (
        <section className="identity-page">
            <h2 className="identity-heading">Use Breadsheet on another device</h2>
            {user && <p className="identity-hint">You're signed in here as <strong>{user.username}</strong>.</p>}

            <p>To sign in on another phone or computer, use the key you saved when you registered:</p>
            <ul className="identity-list">
                <li>Open your saved <strong>sign-in link</strong> on that device, or</li>
                <li>Scan your saved <strong>QR code</strong> with its camera, or</li>
                <li>Go to <Link to="/signin">Sign in</Link> there and paste your <strong>key</strong>.</li>
            </ul>

            <p className="identity-hint">
                Each device stays signed in for a year from its last visit. Signing out on one device doesn't
                affect the others.
            </p>
        </section>
    )
}
