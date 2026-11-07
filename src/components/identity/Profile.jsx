import React from "react"
import { Link, Navigate } from "react-router"
import useSession from "../../hooks/useSession"


// /profile, opened from the username in the header: who's signed in here, and how to use Breadsheet on
// another device. The key is never shown again after registration, so this explains the options instead.
export default function Profile() {
    const { user, status } = useSession()

    if (status === "loading") return null
    if (status !== "signedIn") return <Navigate to="/signin" replace />

    return (
        <section className="identity-page">
            <h2 className="identity-heading">Profile</h2>
            <p>You're signed in here as <strong>{user.username}</strong>.</p>

            <h3 className="identity-subheading">Devices</h3>
            <p>You can use Breadsheet on a different device. Sign in there with the key you saved when you registered:</p>
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
