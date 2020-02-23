import React from 'react';
import seconds_to_string from "../scripts/seconds_to_string";
import recipeData from './recipeData';
import RecipeListItem from "./RecipeListItem";

class RecipeTable extends React.Component {
    constructor() {
        super();
        this.state = {
            recipes: recipeData
        };
    }

    render() {
        const recipeList = this.state.recipes.map(
            recipe => <RecipeListItem key={recipe.id}
                                      id={recipe.id}
                                      name={recipe.name}
                                      author={recipe.author}
                                      source={recipe.source}
                                      difficulty={recipe.difficulty}
                                      length={seconds_to_string(recipe.length)}/>
        );

        return (
            <table className="recipe-table">
                <thead>
                <tr className="table-header-row">
                    <th>Name</th>
                    <th>Author</th>
                    <th>Source</th>
                    <th>Length</th>
                    <th>Difficulty</th>
                </tr>
                </thead>

                <tbody>
                {recipeList}
                </tbody>
            </table>
        )
    }
}

export default RecipeTable;
