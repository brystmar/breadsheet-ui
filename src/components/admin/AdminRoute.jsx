import React from "react"
import { Navigate } from "react-router"
import useSession from "../../hooks/useSession"


// Admin pages (breadsheet-ui#65) render only for signed-in admins; everyone else goes home. The server checks
// again on every admin call, so this only keeps non-admins from seeing screens that can't work for them.
export default function AdminRoute({ children }) {
    const { user, status } = useSession()
    if (status === "loading") return null
    if (status !== "signedIn" || !user?.is_admin) return <Navigate to="/" replace />
    return children
}
