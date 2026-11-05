import React, { useState } from "react"
import { Link, useNavigate } from "react-router"
import SaveKey from "./SaveKey"
import useSession from "../../hooks/useSession"
import { signUp } from "../../data/session_api"
import { describeWait, usernameChecks, usernameIsValid } from "../../helpers/identity"


// /register: pick a username, then save the key (shown once)
export default function FormRegister() {
    const { signedIn } = useSession()
    const navigate = useNavigate()

    const [ username, setUsername ] = useState("")
    const [ submitting, setSubmitting ] = useState(false)
    const [ error, setError ] = useState(null)

    // Held only here, in memory, until the user continues
    const [ created, setCreated ] = useState(null)

    const checks = usernameChecks(username)
    const valid = usernameIsValid(username)

    async function handleSubmit(event) {
        event.preventDefault()
        if (!valid || submitting) return

        setSubmitting(true)
        setError(null)
        const result = await signUp(username.trim())
        setSubmitting(false)

        if (result.ok) {
            setCreated({ user: result.data.user, key: result.data.key })
            return
        }

        setError(result.code === "rate_limited"
            ? `Too many new accounts from this network. Try again in ${describeWait(result.retryAfter)}.`
            : result.message)
    }

    // The account exists and this browser is signed in once the key is saved
    function handleContinue() {
        signedIn(created.user)
        setCreated(null)
        navigate("/")
    }

    if (created) {
        return <SaveKey username={created.user.username} secretKey={created.key} onContinue={handleContinue} />
    }

    return (
        <section className="identity-page">
            <h2 className="identity-heading">Register</h2>
            <p className="identity-hint">
                No email or password: Breadsheet gives you a key instead. Whoever has the key is you.
            </p>

            <form className="identity-form" onSubmit={handleSubmit} noValidate>
                <label className="identity-label" htmlFor="register-username">Username</label>
                <input id="register-username"
                       type="text"
                       name="username"
                       value={username}
                       autoComplete="username"
                       autoCapitalize="none"
                       spellCheck={false}
                       maxLength={30}
                       aria-describedby="register-username-checks"
                       onChange={(event) => setUsername(event.target.value)} />

                {/* Each rule turns from red to green as it's met */}
                <ul id="register-username-checks" className="username-checks">
                    {checks.map((check) => (
                        <li key={check.label} className={check.met ? "username-check met" : "username-check"}>
                            <span className="sr-only">{check.met ? "Done: " : "Not yet: "}</span>
                            {check.label}
                        </li>
                    ))}
                </ul>

                {error && <p className="identity-error" role="alert">{error}</p>}

                <button type="submit" className="btn btn-primary" disabled={!valid || submitting}>
                    {submitting ? "Registering…" : "Register"}
                </button>
            </form>

            <p className="identity-hint">Already have a key? <Link to="/signin">Sign in</Link></p>
        </section>
    )
}
