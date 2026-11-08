import React, { useEffect, useState } from "react"
import { Link, Navigate, useLocation, useParams } from "react-router"
import { resolveRecipePath } from "../data/recipes_api"
import PageTitle from "./PageTitle"
import PlanPage from "./plan/PlanPage"
import StartBakePage from "./bake/StartBakePage"
import RecipeEditPage from "./recipe/RecipeEditPage"
import "../styles/recipe-attributes.sass"


// The recipe page at its public URL (/recipes/<slug> or /recipes/<slug>-<suffix>, M2), its Start bake
// screen at that URL plus /start (`view="start"`), or its editor at /edit (`view="edit"`, owners only).
// Resolves the URL to a recipe, redirects renamed or differently-cased URLs to the current path,
// and shows a not-found page when nothing matches.
export default function RecipePathContainer({ view = "plan" }) {
    const { recipePath } = useParams()
    const location = useLocation()
    const [ result, setResult ] = useState({ recipePath: null })

    // Look the recipe up whenever the URL changes; ignore answers for a URL we've since left
    useEffect(() => {
        let current = true

        resolveRecipePath(recipePath).then((response) => {
            if (current) setResult({ recipePath, response })
        })

        return () => { current = false }
    }, [ recipePath ])

    // Still loading this URL
    if (result.recipePath !== recipePath) {
        return <PageTitle title="" includeHr={true} />
    }

    const { response } = result

    // Not found, or the API couldn't answer
    if (!response.ok) {
        return (
            <section className="recipe-not-found">
                <PageTitle title={response.status === 404 ? "Recipe not found" : "Something went wrong"}
                           includeHr={true} />
                <p>{response.message}</p>
                <p><Link to="/">See all recipes</Link></p>
            </section>
        )
    }

    // A renamed personal recipe (or a differently-cased URL) moves to its current path
    const { recipe } = response.data
    const suffix = view === "plan" ? "" : `/${view}`
    if (recipe.path !== `/recipes/${recipePath}`) {
        return <Navigate to={recipe.path + suffix} replace state={location.state} />
    }

    if (view === "start") return <StartBakePage key={recipe.id} recipe={recipe} />
    if (view === "edit") {
        // Only the owner edits; everyone else gets the plan, with "Make it mine"
        return recipe.is_mine ? <RecipeEditPage key={recipe.id} recipe={recipe} /> : <Navigate to={recipe.path} replace />
    }
    return <PlanPage key={recipe.id} recipe={recipe} />
}
