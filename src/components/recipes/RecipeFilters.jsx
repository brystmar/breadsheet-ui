import React from "react"

const CATEGORIES = [ [ "", "All" ], [ "bread", "Bread" ], [ "prep", "Prep" ] ]


// Search by name, and a category filter
export default function RecipeFilters({ q, onQ, category, onCategory, label = "Search recipes" }) {
    return (
        <div className="recipe-filters">
            <input type="search" className="recipe-search" placeholder="Search by name" aria-label={label}
                   value={q} onChange={(event) => onQ(event.target.value)} />
            <div className="recipe-category-filter" role="group" aria-label="Category">
                {CATEGORIES.map(([ value, name ]) =>
                    <button key={name} type="button" aria-pressed={category === value} onClick={() => onCategory(value)}>
                        {name}
                    </button>)}
            </div>
        </div>
    )
}
