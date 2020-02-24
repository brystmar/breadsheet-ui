import React from 'react';
import seconds_to_string from "../scripts/seconds_to_string";
import RecipeListItem from "./RecipeListItem";

class RecipeTable extends React.Component {
    constructor() {
        super();
        this.state = {
            recipes: []
        };
    }

    componentDidMount() {
        fetch("http://localhost:5000/api/v1/recipes")
            .then(response => response.json())
            .then(response => this.setState({recipes: response.data}))
    }

    render() {
        const recipeList = this.state.recipes.map(
            recipe => <RecipeListItem key={recipe.id}
                                      id={recipe.id}
                                      name={recipe.name}
                                      difficulty={recipe.difficulty}
                                      author={recipe.author}
                                      source={recipe.source}
                                      length={seconds_to_string(recipe.length)}/>
        );

        return (
            <table>
                <thead className="recipe-table">
                <tr className="table-header-row">
                    <th>Name</th>
                    <th>Difficulty</th>
                    <th>Length</th>
                    <th>Author</th>
                    <th>Source</th>
                </tr>
                </thead>

                <tbody className="recipe-table-list">
                {recipeList}
                </tbody>
            </table>
        )
    }
}

export default RecipeTable;
