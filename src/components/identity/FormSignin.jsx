import React, { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import useSession from "../../hooks/useSession"
import { signIn } from "../../data/session_api"
import { describeWait } from "../../helpers/identity"


// The message for a failed sign-in, shared with the key-link page
export function signInErrorMessage(result) {
    if (result.code === "rate_limited") {
        return `Too many sign-in attempts from this network. Try again in ${describeWait(result.retryAfter)}.`
    }
    return result.message
}


// Where to go after signing in: back to the page that sent you here (same site only), else home
export function returnPath(state) {
    const from = state?.from
    return typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : "/"
}


// /signin: paste a key, for when you have the key's text but not its link
export default function FormSignin() {
    const { signedIn } = useSession()
    const navigate = useNavigate()
    const location = useLocation()

    const [ key, setKey ] = useState("")
    const [ submitting, setSubmitting ] = useState(false)
    const [ error, setError ] = useState(null)

    async function handleSubmit(event) {
        event.preventDefault()
        if (!key.trim() || submitting) return

        setSubmitting(true)
        setError(null)
        const result = await signIn(key.trim())
        setSubmitting(false)

        if (result.ok) {
            setKey("")
            signedIn(result.data.user)
            navigate(returnPath(location.state))
            return
        }
        setError(signInErrorMessage(result))
    }

    return (
        <section className="identity-page">
            <h2 className="identity-heading">Sign in</h2>
            <p className="identity-hint">
                The easiest way is to open your saved sign-in link or scan its QR code. Or paste your key here.
            </p>

            <form className="identity-form" onSubmit={handleSubmit}>
                <label className="identity-label" htmlFor="signin-key">Your key</label>
                <input id="signin-key"
                       type="password"
                       name="key"
                       value={key}
                       autoComplete="current-password"
                       autoCapitalize="none"
                       spellCheck={false}
                       onChange={(event) => setKey(event.target.value)} />

                {error && <p className="identity-error" role="alert">{error}</p>}

                <button type="submit" className="btn btn-primary" disabled={submitting || !key.trim()}>
                    {submitting ? "Signing in…" : "Sign in"}
                </button>
            </form>

            <p className="identity-hint">New here? <Link to="/register">Register</Link></p>
        </section>
    )
}
