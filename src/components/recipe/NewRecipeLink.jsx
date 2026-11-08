import React from "react"
import { Link } from "react-router"
import useSession from "../../hooks/useSession"
import "../../styles/recipe-edit.sass"


// "New recipe" above the recipe list, for signed-in users (M2)
export default function NewRecipeLink() {
    const { status } = useSession()
    if (status !== "signedIn") return null
    return <p className="new-recipe-link"><Link to="/recipes/new">+ New recipe</Link></p>
}
