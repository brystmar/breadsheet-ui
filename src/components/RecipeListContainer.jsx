import React from "react";
import RecipeListItem from "./RecipeListItem";
import seconds_to_string from "../helpers/time_display_functions";
import ListHeaderRow from "./ListHeaderRow";


export default function RecipeListContainer({ recipeList = [{ recipe_id: 0, date_created: "" }] }) {
    const recipeComponentList = recipeList.map((recipe, index) =>
        <RecipeListItem
            key={index}
            recipe_id={recipe.id}
            path={recipe.path}
            name={recipe.name}
            author={recipe.author}
            source={recipe.source}
            url={recipe.url}
            difficulty={recipe.difficulty}
            solve_for_start={recipe.solve_for_start}
            length={seconds_to_string(recipe.length,
                recipe.length >= 86400,
                recipe.length < 86400,
                false)}
            // Used to add a class to alternating rows for table-like background stripes
            highlight={index % 2 === 0}
        />
    );

    return (
        <div className="recipe-list-container">
            <ListHeaderRow
                for="recipe"
                colTitles={[ "Name", "Difficulty", "Length", "Author", "Source" ]}
            />
            {recipeComponentList}
        </div>
    )
}


