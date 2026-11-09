import React, { useEffect, useState } from "react"
import { Link } from "react-router"
import PageTitle from "../PageTitle"
import { listAdminRecipes } from "../../data/recipes_api"
import "../../styles/admin.sass"


// /admin/recipes (breadsheet-ui#65): every default recipe, archived ones last, to curate
export default function AdminRecipesPage() {
    const [ recipes, setRecipes ] = useState(null)
    const [ error, setError ] = useState(null)

    useEffect(() => {
        let current = true
        listAdminRecipes().then((result) => {
            if (!current) return
            if (result.ok) setRecipes(result.data.recipes)
            else setError(result.message)
        })
        return () => { current = false }
    }, [])

    return (
        <section className="admin-page">
            <p className="admin-back"><Link to="/profile">← Profile</Link></p>
            <PageTitle title="Default recipes" includeHr={true} />
            <p className="admin-hint">
                Everyone sees these. Edits go live as soon as you save; copies people already made don't change.
            </p>
            <p><Link to="/admin/recipes/new" className="btn btn-primary">New default recipe</Link></p>

            {error && <p className="admin-error" role="alert">{error}</p>}
            {recipes && recipes.length === 0 && <p className="admin-hint">No default recipes yet.</p>}
            {recipes && recipes.length > 0 &&
                <ul className="admin-list">
                    {recipes.map((recipe) =>
                        <li key={recipe.id} className={recipe.archived_at ? "admin-row archived" : "admin-row"}>
                            <span className="admin-row-main">
                                <Link to={`/admin/recipes/${recipe.id}`}>{recipe.name}</Link>
                                {recipe.archived_at && <span className="admin-tag">Archived</span>}
                            </span>
                            <span className="admin-row-meta">
                                {recipe.category === "prep" ? "Prep" : "Bread"} · {recipe.detail_level === "detailed" ? "Detailed" : "Simple"}
                                {" · "}{recipe.step_count} {recipe.step_count === 1 ? "step" : "steps"}
                            </span>
                        </li>)}
                </ul>}
        </section>
    )
}
