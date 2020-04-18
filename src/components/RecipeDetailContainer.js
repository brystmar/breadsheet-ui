import React from 'react';
import {useParams} from 'react-router-dom';
import RecipeDetailSummary from './RecipeDetailSummary';

function RecipeDetailContainer() {
    const {recipeId} = useParams();

    return (
        <RecipeDetailSummary recipeId={recipeId}/>
    )
}

export default RecipeDetailContainer;
