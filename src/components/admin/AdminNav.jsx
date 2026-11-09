import React from "react"
import { NavLink } from "react-router"


// The admin sections (breadsheet-ui#66)
export default function AdminNav() {
    const link = ({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"
    return (
        <nav className="admin-nav" aria-label="Admin">
            <NavLink to="/admin/recipes" className={link}>Recipes</NavLink>
            <NavLink to="/admin/users" className={link}>Users</NavLink>
            <NavLink to="/admin/metrics" className={link}>Metrics</NavLink>
        </nav>
    )
}
