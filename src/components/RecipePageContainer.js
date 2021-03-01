import React from 'react';
import RecipePage from './RecipePage';
import { useParams } from 'react-router-dom';
import "../styles/add-recipe-or-step.sass";
import "../styles/recipe-attributes.sass";

// Middleware because I couldn't figure out how to grab the recipeId for
//   a requested page without useParams.  A hash table would solve this!
// TODO: Make allRecipes a hash table instead of a list
export default function RecipePageContainer(props) {
    let { recipeId } = useParams();
    let recipeDeets = {};

    for (let i = 0; i < props.allRecipes.length; i++) {
        if (props.allRecipes[i].id === { recipeId }) {
            recipeDeets = props.allRecipes[i];
            break;
        }
    }

    return <RecipePage
        recipeId={recipeId}
        recipeData={recipeDeets}
        hasData={!!recipeDeets.id}
        updateOneRecipe={props.updateOneRecipe}
        updateRecipeLength={props.updateRecipeLength}
        updateMasterRecipeList={props.updateMasterRecipeList}
    />
}

RecipePageContainer.defaultProps = {
    allRecipes: [ { id: "" } ],
    hasData:    false
}
