import React from "react"
import { Link } from "react-router"
import PageTitle from "../PageTitle"
import RecipeEditPage from "./RecipeEditPage"
import useSession from "../../hooks/useSession"


// /recipes/new (M2): a blank recipe editor for signed-in users
export default function NewRecipePage() {
    const { status } = useSession()

    if (status === "signedIn") return <RecipeEditPage />
    if (status === "loading") return <PageTitle title="" includeHr={true} />
    return (
        <section className="recipe-edit">
            <PageTitle title="New recipe" includeHr={true} />
            <p>
                To add your own recipes, <Link to="/signin" state={{ from: "/recipes/new" }}>sign in</Link> or <Link to="/register">register</Link>.
            </p>
        </section>
    )
}
