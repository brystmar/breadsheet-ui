import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import SaveKey from "./SaveKey"
import useSession from "../../hooks/useSession"
import { checkUsername, signUp } from "../../data/session_api"
import { TEST_USERNAME_PREFIX, describeWait, usernameChecks, usernameHasTestPrefix, usernameIsValid }
    from "../../helpers/identity"


// How long typing must pause before the username is checked with the server
export const CHECK_DELAY_MS = 500


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
    const testPrefix = usernameHasTestPrefix(username)
    const name = username.trim()

    // Server answers per name (breadsheet-ui#62): { status: "checking" | "available" | "unavailable", message }.
    // A failed check leaves no answer, so it never blocks: signup has the final say.
    const [ answers, setAnswers ] = useState({})
    const answer = valid ? answers[name] : undefined

    async function check(candidate) {
        if (answers[candidate]) return
        setAnswers((known) => ({ ...known, [candidate]: { status: "checking" } }))
        const result = await checkUsername(candidate)
        setAnswers((known) => {
            const next = { ...known }
            if (result.ok && result.data?.available === true) next[candidate] = { status: "available" }
            else if (result.ok && result.data?.available === false) {
                next[candidate] = { status: "unavailable", message: result.data.message }
            } else delete next[candidate]
            return next
        })
    }

    // Check once typing pauses, but only names that already pass the local rules
    useEffect(() => {
        if (!valid || answers[name]) return
        const timer = setTimeout(() => check(name), CHECK_DELAY_MS)
        return () => clearTimeout(timer)
    }, [ name, valid ])  // eslint-disable-line react-hooks/exhaustive-deps

    function handleBlur() {
        if (valid) check(name)
    }

    const unavailable = answer?.status === "unavailable"

    async function handleSubmit(event) {
        event.preventDefault()
        if (!valid || unavailable || submitting) return

        setSubmitting(true)
        setError(null)
        const result = await signUp(username.trim())
        setSubmitting(false)

        if (result.ok) {
            setCreated({ user: result.data.user, key: result.data.key })
            return
        }

        if (result.code === "username_taken" || result.code === "username_invalid") {
            // Taken since the check (or never checked): show it where the check's answer goes
            setAnswers((known) => ({ ...known, [username.trim()]: { status: "unavailable", message: result.message } }))
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
                       aria-describedby={testPrefix ? "register-username-checks register-username-reserved"
                                                    : "register-username-checks register-username-availability"}
                       aria-invalid={testPrefix || unavailable || undefined}
                       onBlur={handleBlur}
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

                {/* Shown until the name stops starting with test- (only the backend makes test users) */}
                {testPrefix && (
                    <p id="register-username-reserved" className="identity-error" role="alert">
                        The <code>{TEST_USERNAME_PREFIX}</code> prefix is reserved
                    </p>
                )}

                {/* The server's answer for this exact name (breadsheet-ui#62) */}
                <p id="register-username-availability" className="username-availability" aria-live="polite">
                    {answer?.status === "checking" && <span className="identity-hint">Checking…</span>}
                    {answer?.status === "available" && <span className="available">✓ Available</span>}
                    {unavailable && <span className="identity-error">{answer.message}</span>}
                </p>

                {error && <p className="identity-error" role="alert">{error}</p>}

                <button type="submit" className="btn btn-primary" disabled={!valid || unavailable || submitting}>
                    {submitting ? "Registering…" : "Register"}
                </button>
            </form>

            <p className="identity-hint">Already have a key? <Link to="/signin">Sign in</Link></p>
        </section>
    )
}
