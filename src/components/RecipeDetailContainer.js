import React from 'react';
import RecipeDetailSummary from './RecipeDetailSummary';
import {useParams} from 'react-router-dom';

// Middleware because I couldn't figure out how to grab the recipeId for
//   a requested page without useParams.  A hash table would solve this!
// TODO: Make allRecipes a hash table instead of a list
function RecipeDetailContainer(props) {
    let {recipeId} = useParams();
    let recipeDeets = {};

    for (let i = 0; i < props.allRecipes.length; i++) {
        if (props.allRecipes[i].id === {recipeId}) {
            recipeDeets = props.allRecipes[i];
            break;
        }
    }

    return <RecipeDetailSummary recipeId={recipeId}
                                recipeData={recipeDeets}
                                hasData={!!recipeDeets.id}
                                updateOneRecipe={props.updateOneRecipe}
                                updateRecipeLength={props.updateRecipeLength}
                                updateMasterRecipeList={props.updateMasterRecipeList}/>
}

RecipeDetailContainer.defaultProps = {
    allRecipes: [{id: ""}],
    hasData: false
}

export default RecipeDetailContainer;