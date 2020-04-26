import React from 'react';
import seconds_to_string from '../scripts/time_display_functions';
import RecipeListItem from './RecipeListItem';
import AddRecipe from './AddRecipe';
import BackendUrlContext from './BackendUrlContext';

class RecipeTable extends React.Component {
    constructor() {
        super();
        this.state = {
            allRecipes: [],
            editMode: false
        };

        this.addRecipeToState = this.addRecipeToState.bind(this);
        this.toggleEditMode = this.toggleEditMode.bind(this);
        this.deleteRecipe = this.deleteRecipe.bind(this);
        this.deleteRecipeFromState = this.deleteRecipeFromState.bind(this);
    }

    componentDidMount() {
        // Get the recipe details from the backend
        fetch(this.context + "/api/v1/recipes")
            .then(response => response.json())
            .then(result => this.setState({allRecipes: result.data}))
            .catch(error => console.log("Error retrieving data for all recipes:", error));
    }

    addRecipeToState(recipe) {
        // console.log("Called addRecipeToState for", recipe);
        let updatedRecipes = this.state.allRecipes;
        updatedRecipes.push(recipe);

        this.setState({
            allRecipes: updatedRecipes
        })
    }

    toggleEditMode(mode = !this.state.editMode) {
        this.setState({
            editMode: mode
        })
    }

    deleteRecipe(recipe_id) {
        console.log("Attempting to delete recipe", recipe_id);

        // Tell the backend to remove this recipe from the database
        fetch(this.context + "/api/v1/recipe/" + recipe_id, {
            method: "DELETE"
        })
            .then(response => {
                if (response.ok) {
                    console.log("Delete successful for recipe_id=" + recipe_id.toString());
                    // Remove this recipe from local state
                    this.deleteRecipeFromState(recipe_id)

                    // Remove this recipe from the NavBar recipe list
                    // TODO: Remove this recipe from the NavBar recipe list

                } else {
                    console.log("Delete failed for recipe_id=" + recipe_id.toString());
                    console.log("Details:", response.body);
                }
            })
            .catch(error => console.log("Delete failed:", error));
    }

    deleteRecipeFromState(recipe_id) {
        // console.log("Called deleteRecipeFromState for id=" + recipe_id);
        let newList = this.state.allRecipes.filter(
            function (terminator) {
                return terminator.id !== recipe_id
            });

        this.setState({allRecipes: newList});
    }

    render() {
        const recipeComponentList = this.state.allRecipes.map(
            recipe => <RecipeListItem key={recipe.id}
                                      id={recipe.id}
                                      name={recipe.name}
                                      author={recipe.author}
                                      source={recipe.source}
                                      difficulty={recipe.difficulty}
                                      solve_for_start={recipe.solve_for_start}
                                      length={seconds_to_string(recipe.length, true, true, false)}
                                      hidden={!this.state.editMode}
                                      delete_recipe={this.deleteRecipe}/>
        );

        return (
            <div className="recipe-detail.container" id="recipeTable">
                <table className="recipe-table">
                    <thead className="table-header-row">
                    <tr>
                        <th hidden={!this.state.editMode}>&nbsp;</th>
                        <th>Name</th>
                        <th>Difficulty</th>
                        <th>Length</th>
                        <th>Author</th>
                        <th>Source</th>
                    </tr>
                    </thead>

                    <tbody className="recipe-table-list">
                    {recipeComponentList}
                    </tbody>
                </table>
                <AddRecipe addRecipeToState={this.addRecipeToState}
                           hidden={!this.state.editMode}
                           toggleEditMode={this.toggleEditMode}/>
            </div>
        )
    }
}

RecipeTable.contextType = BackendUrlContext;

export default RecipeTable;
