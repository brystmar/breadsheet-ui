import React from 'react';
import {Link} from 'react-router-dom';
import BackendUrlContext from './BackendUrlContext';

class RecipeListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}

        this.handleDeleteRecipe = this.handleDeleteRecipe.bind(this);
    }

    handleDeleteRecipe() {
        // TODO: This belongs in the parent class, not here
        console.log("Attempting to delete recipe", this.props.id);

        // Tell the backend to remove this recipe from the database
        fetch(this.context + "/api/v1/recipe/" + this.props.id, {
            method: "DELETE"
        })
            .then(response => {
                if (response.ok) {
                    console.log("Delete successful for: " + this.props.name + " (" + this.props.id + ")");
                    this.props.delete_recipe(this.props.id);

                    // TODO: Remove this recipe from the NavBar recipe list

                } else {
                    console.log("Delete failed for: " + this.props.name + " (" + this.props.id + ")");
                    console.log("Details:", response.body);
                }
            }).catch(rejection => console.log("Delete failed:", rejection));
    }

    render() {
        return (
            <tr className="recipe-table-list-item">
                <td className="delete-recipe-button-column">
                    <img alt="Delete recipe"
                         src="./button_minus.png"
                         className="delete-recipe-button"
                         onClick={this.handleDeleteRecipe}/>
                </td>
                <td className="recipe-list-item-name">
                    <Link to={`/${this.props.id}`}>{this.props.name}</Link>
                </td>
                <td>{this.props.difficulty}</td>
                <td>{this.props.length}</td>
                <td>{this.props.author}</td>
                <td>{this.props.source}</td>
            </tr>
        )
    }
}

RecipeListItem.contextType = BackendUrlContext;

export default RecipeListItem;
