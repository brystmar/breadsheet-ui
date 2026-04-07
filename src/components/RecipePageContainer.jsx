import React from 'react';
import RecipePage from './RecipePage';
import { useParams } from 'react-router-dom';
import "../styles/add-recipe-or-step.sass";
import "../styles/recipe-attributes.sass";

// Middleware because I couldn't figure out how to grab the recipeId for
//   a requested page without useParams.  A hash table would solve this!
// TODO: Make recipeList a hash table instead of a list
export default function RecipePageContainer({ recipeList = [{ id: "" }], hasData = false, updateOneRecipe, updateRecipeLength, updateMasterRecipeList }) {
    let { recipeId } = useParams();
    let recipeDeets = {};

    for (let i = 0; i < recipeList.length; i++) {
        if (recipeList[i].id === { recipeId }) {
            recipeDeets = recipeList[i];
            break;
        }
    }

    return <RecipePage
        recipeId={recipeId}
        recipeData={recipeDeets}
        hasData={hasData}
        updateOneRecipe={updateOneRecipe}
        updateRecipeLength={updateRecipeLength}
        updateMasterRecipeList={updateMasterRecipeList}
    />
}
