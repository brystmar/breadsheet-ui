import React from 'react';
import {useParams} from 'react-router-dom';
import RecipeDetailSummary from './RecipeDetailSummary';

function RecipeDetailContainer() {
    const {recipeId} = useParams();

    return (
        <div className="recipe-detail-container">
            <RecipeDetailSummary recipeId={recipeId} />
        </div>
    )
}

export default RecipeDetailContainer;
