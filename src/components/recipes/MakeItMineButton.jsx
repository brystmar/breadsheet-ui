import React, { useState } from "react"
import { Link, useNavigate } from "react-router"
import useSession from "../../hooks/useSession"
import { copyRecipe } from "../../data/recipes_api"


// Copies a recipe into the signed-in user's collection and opens the copy; signed out, it links to sign in
export default function MakeItMineButton({ recipe, returnTo = "/" }) {
    const navigate = useNavigate()
    const { status } = useSession()
    const [ copying, setCopying ] = useState(false)
    const [ error, setError ] = useState(null)

    if (status !== "signedIn") {
        return <Link className="btn btn-default make-it-mine" to="/signin" state={{ from: returnTo }}>Sign in to make it yours</Link>
    }

    async function copy() {
        setCopying(true)
        setError(null)
        const result = await copyRecipe(recipe.id)
        setCopying(false)
        if (result.ok) navigate(result.data.recipe.path)
        else setError(result.message)
    }

    return (
        <span className="make-it-mine-wrap">
            <button type="button" className="btn btn-default make-it-mine" disabled={copying}
                    aria-label={`Make ${recipe.name || "this recipe"} mine`} onClick={copy}>
                {copying ? "Copying…" : "Make it mine"}
            </button>
            {error && <span className="make-it-mine-error" role="alert">{error}</span>}
        </span>
    )
}
