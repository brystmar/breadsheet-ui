import React, { useEffect, useState } from "react"
import AdminNav from "./AdminNav"
import PageTitle from "../PageTitle"
import SaveKey from "../identity/SaveKey"
import useSession from "../../hooks/useSession"
import { listUsers, renameUser, resetUserKey } from "../../data/admin_api"
import { checkUsername } from "../../data/session_api"
import "../../styles/admin.sass"

// How long typing must pause before searching or checking a new name
export const ADMIN_TYPING_DELAY_MS = 400


function day(iso) {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}


// Rename inline, with the registration page's availability check. Only "taken" blocks Save: admins may use
// reserved names, and the server has the final say on everything else.
function RenameForm({ user, onRenamed, onCancel }) {
    const [ name, setName ] = useState(user.username)
    const [ answer, setAnswer ] = useState(null)  // { name, available, code, message }
    const [ saving, setSaving ] = useState(false)
    const [ error, setError ] = useState(null)
    const trimmed = name.trim()
    const unchanged = trimmed === user.username

    useEffect(() => {
        if (!trimmed || trimmed.toLowerCase() === user.username.toLowerCase()) return
        let current = true
        const timer = setTimeout(async () => {
            const result = await checkUsername(trimmed)
            if (current && result.ok) setAnswer({ name: trimmed, ...result.data })
        }, ADMIN_TYPING_DELAY_MS)
        return () => { current = false; clearTimeout(timer) }
    }, [ trimmed, user.username ])

    const shown = answer?.name === trimmed ? answer : null
    const taken = shown?.code === "username_taken"

    async function save(event) {
        event.preventDefault()
        setSaving(true)
        setError(null)
        const result = await renameUser(user.id, trimmed)
        setSaving(false)
        if (result.ok) onRenamed(result.data.user)
        else setError(result.message)
    }

    return (
        <form className="admin-rename" onSubmit={save} noValidate>
            <label className="sr-only" htmlFor={`rename-${user.id}`}>New username for {user.username}</label>
            <input id={`rename-${user.id}`} className="edit-input" type="text" value={name} maxLength={30}
                   autoCapitalize="none" spellCheck={false} onChange={(event) => setName(event.target.value)} />
            <button type="submit" className="btn btn-primary" disabled={saving || unchanged || !trimmed || taken}>
                {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" className="btn btn-default" onClick={onCancel}>Cancel</button>
            {shown && shown.available && <span className="admin-ok">✓ Available</span>}
            {shown && !shown.available &&
                <span className={taken ? "admin-error" : "admin-hint"}>
                    {shown.message}{!taken && " Admins can still try it."}
                </span>}
            {error && <span className="admin-error" role="alert">{error}</span>}
        </form>
    )
}


// /admin/users (breadsheet-ui#66): who's here, with Rename and Reset key
export default function AdminUsersPage() {
    const { user: me } = useSession()
    const [ q, setQ ] = useState("")
    const [ active, setActive ] = useState(false)
    const [ hideTests, setHideTests ] = useState(true)
    const [ users, setUsers ] = useState(null)
    const [ error, setError ] = useState(null)

    const [ renaming, setRenaming ] = useState(null)    // user id
    const [ confirming, setConfirming ] = useState(null) // user id awaiting reset confirmation
    const [ resetting, setResetting ] = useState(false)
    const [ resetError, setResetError ] = useState(null)
    const [ handover, setHandover ] = useState(null)    // { username, key }, shown once

    // Search waits for a pause in typing; the checkboxes apply right away
    useEffect(() => {
        let current = true
        const timer = setTimeout(async () => {
            const result = await listUsers({ q, active, hideTests })
            if (!current) return
            if (result.ok) {
                setUsers(result.data.users)
                setError(null)
            } else setError(result.message)
        }, q ? ADMIN_TYPING_DELAY_MS : 0)
        return () => { current = false; clearTimeout(timer) }
    }, [ q, active, hideTests ])

    async function reset(target) {
        setResetting(true)
        setResetError(null)
        const result = await resetUserKey(target.id)
        setResetting(false)
        if (!result.ok) {
            setResetError(result.message)
            return
        }
        setConfirming(null)
        setHandover({ username: result.data.user.username, key: result.data.key })
        window.scrollTo(0, 0)  // the key screen starts at the top, wherever the row was
    }

    function renamed(updated) {
        setUsers((current) => current.map((u) => u.id === updated.id ? { ...u, username: updated.username } : u))
        setRenaming(null)
    }

    // The new key, once; leaving this screen forgets it
    if (handover) {
        return <SaveKey handover={true} username={handover.username} secretKey={handover.key}
                        onContinue={() => setHandover(null)} />
    }

    return (
        <section className="admin-page">
            <AdminNav />
            <PageTitle title="Users" includeHr={true} />

            <div className="admin-filters">
                <label className="sr-only" htmlFor="admin-user-search">Search usernames</label>
                <input id="admin-user-search" className="edit-input" type="search" placeholder="Search usernames"
                       value={q} onChange={(event) => setQ(event.target.value)} />
                <label><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
                    {" "}Active only</label>
                <label><input type="checkbox" checked={hideTests} onChange={(event) => setHideTests(event.target.checked)} />
                    {" "}Hide test users</label>
            </div>
            <p className="admin-hint">Active means seen in the last 30 days. Admin status changes only from the command line.</p>

            {error && <p className="admin-error" role="alert">{error}</p>}
            {users && users.length === 0 && <p className="admin-hint">No users match.</p>}
            {users && users.length > 0 &&
                <ul className="admin-list">
                    {users.map((u) =>
                        <li key={u.id} className="admin-row admin-user">
                            <div className="admin-user-main">
                                <strong>{u.username}</strong>
                                {u.is_admin && <span className="admin-tag">Admin</span>}
                                {u.is_test && <span className="admin-tag">Test</span>}
                                <span className="admin-row-meta">
                                    Joined {day(u.created_at)} · Last seen {day(u.last_seen_at)}
                                    {" · "}{u.recipe_count} {u.recipe_count === 1 ? "recipe" : "recipes"}
                                    {u.published_count > 0 && ` (${u.published_count} published)`}
                                    {" · "}{u.bake_count} {u.bake_count === 1 ? "bake" : "bakes"}
                                    {u.active_bake_count > 0 && ` (${u.active_bake_count} active)`}
                                </span>
                            </div>

                            {renaming === u.id ?
                                <RenameForm user={u} onRenamed={renamed} onCancel={() => setRenaming(null)} /> :
                                confirming !== u.id &&
                                <div className="admin-actions">
                                    <button type="button" className="btn btn-default"
                                            onClick={() => { setRenaming(u.id); setConfirming(null) }}>Rename</button>
                                    {u.id !== me?.id &&
                                        <button type="button" className="btn btn-danger"
                                                onClick={() => { setConfirming(u.id); setRenaming(null); setResetError(null) }}>
                                            Reset key
                                        </button>}
                                </div>}

                            {confirming === u.id &&
                                <div className="admin-confirm" role="alertdialog" aria-labelledby={`reset-${u.id}`}>
                                    <p id={`reset-${u.id}`}>
                                        Reset {u.username}'s key? Their current key stops working and they're signed out
                                        everywhere. Only do this for someone you can verify.
                                    </p>
                                    {resetError && <p className="admin-error" role="alert">{resetError}</p>}
                                    <div className="admin-actions">
                                        <button type="button" className="btn btn-default" onClick={() => setConfirming(null)}>
                                            Keep it
                                        </button>
                                        <button type="button" className="btn btn-danger" disabled={resetting}
                                                onClick={() => reset(u)}>
                                            {resetting ? "Resetting…" : "Reset key"}
                                        </button>
                                    </div>
                                </div>}
                        </li>)}
                </ul>}
        </section>
    )
}
