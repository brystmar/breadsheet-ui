import React, { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router"
import useFeatureLevel from "../../hooks/useFeatureLevel"
import useSession from "../../hooks/useSession"
import { signIn } from "../../data/session_api"
import { keyFromHash } from "../../helpers/identity"
import { signInErrorMessage } from "./FormSignin"


// /k#<key>: signs this browser in from a key link. Works at every feature level, because a link
// opened on a new device starts at the default level.
export default function KeyLink() {
    const { setLevel } = useFeatureLevel()
    const { signedIn } = useSession()
    const navigate = useNavigate()

    // Read the key once, on the first render, before the address bar is cleaned up
    const keyRef = useRef(keyFromHash(window.location.hash))
    const started = useRef(false)
    const [ error, setError ] = useState(null)

    useEffect(() => {
        // StrictMode runs effects twice in development; sign in only once
        if (started.current) return
        started.current = true

        // Remove the key from the address bar and history before anything else happens
        window.history.replaceState(window.history.state, "", "/k")

        const key = keyRef.current
        keyRef.current = null
        if (!key) {
            setError("This link doesn't contain a key. Open the full link you saved, or paste your key instead.")
            return
        }

        signIn(key).then((result) => {
            if (result.ok) {
                setLevel("m2")
                signedIn(result.data.user)
                navigate("/", { replace: true })
            } else {
                setError(signInErrorMessage(result))
            }
        })
    }, [ navigate, setLevel, signedIn ])

    return (
        <section className="identity-page">
            <h2 className="identity-heading">{error ? "Couldn't sign in" : "Signing in…"}</h2>
            {error && (
                <>
                    <p className="identity-error" role="alert">{error}</p>
                    <p className="identity-hint"><Link to="/signin">Paste your key instead</Link></p>
                </>
            )}
        </section>
    )
}
