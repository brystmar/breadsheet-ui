import React from "react"
import { Link, useNavigate } from "react-router"
import useSession from "../../hooks/useSession"


// Header links at M2: "Sign up · Sign in", or "username · Devices · Sign out"
export default function NavAccount() {
    const { user, status, signOut } = useSession()
    const navigate = useNavigate()

    async function handleSignOut() {
        await signOut()
        navigate("/")
    }

    if (status === "idle" || status === "loading") return null

    return (
        <div className="nav-account">
            {status === "signedIn" ? (
                <>
                    <span className="nav-account-user">{user.username}</span>
                    <Link to="/devices" className="nav-account-link">Devices</Link>
                    <button type="button" className="nav-account-link nav-account-button" onClick={handleSignOut}>
                        Sign out
                    </button>
                </>
            ) : (
                <>
                    <Link to="/signup" className="nav-account-link">Sign up</Link>
                    <Link to="/signin" className="nav-account-link">Sign in</Link>
                </>
            )}
        </div>
    )
}
