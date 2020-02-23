import React from 'react';
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
        const recipeItems = this.state.recipes.map(item => <RecipeListItem key={item.id}
                                                                           id={item.id}
                                                                           name={item.name}
                                                                           author={item.author}
                                                                           source={item.source}
                                                                           difficulty={item.difficulty}
                                                                           added={item.date_added}/>
        );

        return (
            <table className="recipe-table">
                <thead>
                <tr className="table-header-row">
                    <th>Name</th>
                    <th>Author</th>
                    <th>Source</th>
                    <th>Difficulty</th>
                    <th>Added</th>
                </tr>
                </thead>

                <tbody>
                {recipeItems}
                </tbody>
            </table>
        )
    }
}

export default RecipeTable;
