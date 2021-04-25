import React from 'react';
import RecipePage from './RecipePage';
import { useParams } from 'react-router-dom';
import "../styles/add-recipe-or-step.sass";
import "../styles/recipe-attributes.sass";

// Middleware because I couldn't figure out how to grab the recipeId for
//   a requested page without useParams.  A hash table would solve this!
// TODO: Make recipeList a hash table instead of a list
export default function RecipePageContainer(props) {
    let { recipeId } = useParams();
    let recipeDeets = {};

    for (let i = 0; i < props.recipeList.length; i++) {
        if (props.recipeList[i].id === { recipeId }) {
            recipeDeets = props.recipeList[i];
            break;
        }
    }

    return <RecipePage
        recipeId={recipeId}
        recipeData={recipeDeets}
        hasData={props.hasData}
        updateOneRecipe={props.updateOneRecipe}
        updateRecipeLength={props.updateRecipeLength}
        updateMasterRecipeList={props.updateMasterRecipeList}
    />
}

RecipePageContainer.defaultProps = {
    recipeList: [ { id: "" } ],
    hasData:    false
}
