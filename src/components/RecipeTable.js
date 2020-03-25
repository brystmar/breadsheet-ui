import React from 'react';
import seconds_to_string from "../scripts/seconds_to_string";
import RecipeListItem from "./RecipeListItem";
import AddRecipe from "./AddRecipe";

class RecipeTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allRecipes: []
        };

        this.addRecipeToState = this.addRecipeToState.bind(this);
        this.deleteRecipeFromState = this.deleteRecipeFromState.bind(this);
    }

    componentDidMount() {
        // Get the recipe details from the backend
        fetch("http://localhost:5000/api/v1/recipes")
            .then(response => response.json())
            .then(result => this.setState({allRecipes: result.data}))
    }

    addRecipeToState(recipe) {
        console.log("Called addRecipeToState for", recipe);

        let updatedRecipes = this.state.allRecipes;
        updatedRecipes.push(recipe);

        this.setState({
            allRecipes: updatedRecipes
        })
    }

    deleteRecipeFromState(recipe_id) {
        console.log("Called deleteRecipeFromState for id=" + recipe_id);

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
                                      length={seconds_to_string(recipe.length)}
                                      delete_recipe={this.deleteRecipeFromState} />
        );

        return (
            <div id="recipeTable">
                <table className="recipe-table">
                    <thead className="table-header-row">
                    <tr>
                        <th>&nbsp;</th>
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
                <AddRecipe render={this.addRecipeToState}/>
            </div>
        )
    }
}

export default RecipeTable;
