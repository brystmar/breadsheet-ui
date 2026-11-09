import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import RecipeEditPage from "../recipe/RecipeEditPage"
import { getRecipe } from "../../data/recipes_api"


// /admin/recipes/new and /admin/recipes/:recipeId (breadsheet-ui#65): the recipe editor in admin mode
export default function AdminRecipeEdit() {
    const { recipeId } = useParams()
    const [ loaded, setLoaded ] = useState(null)  // { recipe } or { error }

    useEffect(() => {
        if (!recipeId) return
        let current = true
        getRecipe(recipeId).then((result) => {
            if (!current) return
            if (result.ok && result.data?.recipe?.scope === "default") setLoaded({ recipe: result.data.recipe })
            else setLoaded({ error: result.ok ? "That isn't a default recipe." : result.message })
        })
        return () => { current = false }
    }, [ recipeId ])

    if (!recipeId) return <RecipeEditPage admin={true} />
    if (!loaded) return null
    if (loaded.error) {
        return (
            <section className="admin-page">
                <p className="admin-error" role="alert">{loaded.error}</p>
                <p><Link to="/admin/recipes">← Default recipes</Link></p>
            </section>
        )
    }
    // Keyed by id, so moving from one recipe to another starts a fresh form
    return <RecipeEditPage key={loaded.recipe.id} recipe={loaded.recipe} admin={true} />
}
