import React from "react"
import { Link } from "react-router"
import seconds_to_string from "../../helpers/time_display_functions"

const CATEGORY_NAMES = { bread: "Bread", prep: "Prep" }


// "1 day" or "3 hours"
function lengthText(seconds) {
    if (!seconds) return null
    return seconds_to_string(seconds, seconds >= 86400, seconds < 86400, false)
}


// One recipe in a list: its name, a line of details, and an optional action (like Make it mine)
export default function RecipeRow({ recipe, showOwner = false, showDetail = false, children }) {
    const details = [
        showOwner && recipe.owner ? `by ${recipe.owner}` : null,
        CATEGORY_NAMES[recipe.category] || null,
        showDetail ? (recipe.detail_level === "detailed" ? "Detailed" : "Simple") : null,
        lengthText(recipe.length_seconds),
        recipe.difficulty
    ].filter(Boolean)

    return (
        <li className="recipe-row">
            <span className="recipe-row-main">
                <Link to={recipe.path} className="recipe-row-name">{recipe.name || "Untitled draft"}</Link>
                {recipe.is_draft && <span className="recipe-badge draft">Draft</span>}
                {recipe.published_at && !showOwner && <span className="recipe-badge published">Published</span>}
                <span className="recipe-row-details">{details.join(" · ")}</span>
            </span>
            {children && <span className="recipe-row-action">{children}</span>}
        </li>
    )
}
