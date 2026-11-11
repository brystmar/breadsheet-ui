import React from "react"
import { Link, Navigate } from "react-router"
import HomeAssistant from "./HomeAssistant"
import useSession from "../../hooks/useSession"


// /profile, opened from the username in the header: who's signed in here, how to use Breadsheet on
// another device, and pairing Home Assistant (breadsheet-ui#29). The key is never shown again after registration, so this explains the options instead.
export default function Profile() {
    const { user, status } = useSession()

    if (status === "loading") return null
    if (status !== "signedIn") return <Navigate to="/signin" replace />

    return (
        <section className="identity-page">
            <h2 className="identity-subheading">Devices</h2>
            <p>Three ways to use Breadsheet on a different device:</p>
            <ul className="identity-list">
                <li>Open your saved sign-in link on that device</li>
                <li>Scan your saved QR code with its camera</li>
                <li>Go to <Link to="/signin">Sign in</Link> and paste the key provided at registration.</li>
            </ul>

            <p>
                Each device stays signed in for 1 year since its last visit. Signing out on one device doesn't
                affect the others.
            </p>

            {user.is_admin &&
                <>
                    <h2 className="identity-subheading">Admin</h2>
                    <p>As an admin, you may use the <Link to="/admin">admin console</Link> to modify default recipes, manage users, and view metrics.</p>
                </>}

            <HomeAssistant />
        </section>
    )
}
