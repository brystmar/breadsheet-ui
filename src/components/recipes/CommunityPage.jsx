import React from "react"
import PageTitle from "../PageTitle"
import RecipeFilters from "./RecipeFilters"
import RecipeRow from "./RecipeRow"
import MakeItMineButton from "./MakeItMineButton"
import useRecipeSearch from "../../hooks/useRecipeSearch"
import useSession from "../../hooks/useSession"
import { listCommunityRecipes } from "../../data/recipes_api"
import "../../styles/recipe-lists.sass"


// /community (M2, breadsheet-ui#39): recipes people have published, newest first, for everyone. Each can
// be copied into your own collection with Make it mine.
export default function CommunityPage() {
    const { user } = useSession()
    const search = useRecipeSearch(listCommunityRecipes, user?.id ?? null)
    const filtering = Boolean(search.q.trim() || search.category)

    return (
        <section className="recipe-lists">
            <PageTitle title="Community library" includeHr={true} />
            <p className="recipe-lists-intro">
                Recipes bakers have shared. Make one yours to change its waits and bake it your way; the original stays as it is.
            </p>

            <div className="recipe-lists-toolbar">
                <RecipeFilters q={search.q} onQ={search.setQ} category={search.category} onCategory={search.setCategory}
                               label="Search the community library" />
            </div>

            {search.status === "error" && <p className="recipe-lists-error" role="alert">{search.message}</p>}
            {search.status === "ready" && search.recipes.length === 0 &&
                <p className="recipe-lists-empty">
                    {filtering ? "No community recipes match." : "Nobody has shared a recipe yet. Publish one of yours from its edit page."}
                </p>}

            <ul className="recipe-list" aria-label="Community recipes">
                {search.recipes.map((recipe) =>
                    <RecipeRow key={recipe.id} recipe={recipe} showOwner={true} showDetail={true}>
                        {recipe.is_mine ? <span className="recipe-badge yours">Yours</span> :
                            <MakeItMineButton recipe={recipe} returnTo="/community" />}
                    </RecipeRow>)}
            </ul>
        </section>
    )
}
