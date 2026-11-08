import React from "react"
import { Link } from "react-router"
import PageTitle from "../PageTitle"
import ActiveBakesList from "../bake/ActiveBakesList"
import RecipeFilters from "./RecipeFilters"
import RecipeRow from "./RecipeRow"
import MakeItMineButton from "./MakeItMineButton"
import useRecipeSearch from "../../hooks/useRecipeSearch"
import useSession from "../../hooks/useSession"
import { listRecipes } from "../../data/recipes_api"
import "../../styles/recipe-lists.sass"


// The home page from M2 (breadsheet-ui#39): active bakes, then the signed-in user's own recipes and the
// defaults to browse and copy, with search and a category filter. Signed out, just the defaults.
export default function MyRecipesPage() {
    const { status, user } = useSession()
    const signedIn = status === "signedIn"
    const search = useRecipeSearch(listRecipes, user?.id ?? null)
    const filtering = Boolean(search.q.trim() || search.category)

    const mine = search.recipes.filter((recipe) => recipe.is_mine)
    const defaults = search.recipes.filter((recipe) => recipe.scope === "default")

    return (
        <section className="recipe-lists">
            <ActiveBakesList />
            <PageTitle title="Recipes" includeHr={true} />

            <div className="recipe-lists-toolbar">
                <RecipeFilters q={search.q} onQ={search.setQ} category={search.category} onCategory={search.setCategory} />
                <span className="recipe-lists-links">
                    {signedIn && <Link to="/recipes/new">+ New recipe</Link>}
                    <Link to="/community">Community library</Link>
                </span>
            </div>

            {search.status === "error" && <p className="recipe-lists-error" role="alert">{search.message}</p>}

            {signedIn &&
                <section aria-labelledby="mine-heading">
                    <h2 id="mine-heading">Your recipes</h2>
                    {search.status === "ready" && mine.length === 0 &&
                        <p className="recipe-lists-empty">
                            {filtering ? "None of your recipes match." :
                                <>None yet. Make one of the recipes below yours, <Link to="/recipes/new">start a new one</Link>, or
                                    browse the <Link to="/community">community library</Link>.</>}
                        </p>}
                    <ul className="recipe-list" aria-label="Your recipes">
                        {mine.map((recipe) => <RecipeRow key={recipe.id} recipe={recipe} />)}
                    </ul>
                </section>}

            <section aria-label="Breadsheet recipes">
                {/* Signed out, these are the only recipes, under the page's own title */}
                {signedIn && <h2>Breadsheet recipes</h2>}
                {search.status === "ready" && defaults.length === 0 &&
                    <p className="recipe-lists-empty">No recipes match.</p>}
                <ul className="recipe-list" aria-label="Breadsheet recipes">
                    {defaults.map((recipe) =>
                        <RecipeRow key={recipe.id} recipe={recipe}>
                            {signedIn && <MakeItMineButton recipe={recipe} />}
                        </RecipeRow>)}
                </ul>
            </section>
        </section>
    )
}
