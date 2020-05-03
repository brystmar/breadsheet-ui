import React from 'react';
import seconds_to_string from '../scripts/time_display_functions';
import RecipeListItem from './RecipeListItem';
import AddRecipe from './AddRecipe';
import Table from 'react-bootstrap/Table';

class RecipeTable extends React.Component {
    constructor() {
        super();
        this.state = {
            editMode: false
        };

        this.toggleEditMode = this.toggleEditMode.bind(this);
    }

    toggleEditMode(mode = !this.state.editMode) {
        this.setState({
            editMode: mode
        })
    }

    render() {
        const recipeComponentList = this.props.allRecipes.map(
            recipe => <RecipeListItem key={recipe.id}
                                      recipe_id={recipe.id}
                                      name={recipe.name}
                                      author={recipe.author}
                                      source={recipe.source}
                                      difficulty={recipe.difficulty}
                                      solve_for_start={recipe.solve_for_start}
                                      length={seconds_to_string(recipe.length,
                                          recipe.length >= 86400,
                                          recipe.length < 86400,
                                          false)}
                                      hidden={!this.state.editMode}
                                      deleteRecipe={this.props.deleteRecipe}/>
        );

        return (
            <div className="recipe-detail-container4" id="recipeTable4">
                <Table className="recipe-table4" striped>
                    <thead className="table-header-row">
                    <tr>
                        <th hidden={!this.state.editMode}>&nbsp;</th>
                        <th>Recipe Name</th>
                        <th>Difficulty</th>
                        <th>Length</th>
                        <th>Author</th>
                        <th>Source</th>
                    </tr>
                    </thead>

                    <tbody className="recipe-table-list">
                    {recipeComponentList}
                    </tbody>
                </Table>
                <AddRecipe addRecipeToState={this.props.addRecipeToState}
                           hidden={!this.state.editMode}
                           toggleEditMode={this.toggleEditMode}/>
            </div>
        )
    }
}

RecipeTable.defaultProps = {
    allRecipes: []
}

export default RecipeTable;
