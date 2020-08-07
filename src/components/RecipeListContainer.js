import React, {useState} from 'react';
import RecipeListItem from './RecipeListItem';
import seconds_to_string from '../scripts/time_display_functions';
import RecipeListHeader from "./RecipeListHeader";

function RecipeListContainer(props) {
    const [editMode, toggleEditMode] = useState(false)
    const recipeComponentList = props.allRecipes.map(
        recipe => <RecipeListItem key={recipe.id}
                                  recipe_id={recipe.id}
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
                                  hidden={!editMode}
                                  deleteRecipe={props.deleteRecipe}/>
    );

    return (
        <div className="recipe-list-container">
            <RecipeListHeader
                onClickFn={toggleEditMode}
                onClickParam={!editMode}/>
            {recipeComponentList}
        </div>
    )
}

RecipeListContainer.defaultProps = {
    allRecipes: [{
        recipe_id: 0,
        date_created: ""
    }]
}

export default RecipeListContainer;
