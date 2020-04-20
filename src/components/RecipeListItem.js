import React from 'react';
import {Link} from 'react-router-dom';

function RecipeListItem(props) {
    function handleDeleteRecipe() {
        console.log("Attempting to delete recipe", props.id);

        // Ask the backend to remove this recipe from the database
        fetch("http://localhost:5000/api/v1/recipe/" + props.id, {
            method: "DELETE"
        })
            .then(response => {
                if (response.ok) {
                    console.log("Delete successful for: " + props.name + " (" + props.id + ")");
                    props.delete_recipe(props.id);

                    // TODO: Figure out how to update the NavBar recipe list

                } else {
                    console.log("Delete failed for: " + props.name + " (" + props.id + ")");
                    console.log("Details:", response.body);
                }
            }).catch(rejection => console.log("Delete failed:", rejection));
    }

    return (
        <tr className="recipe-table-list-item">
            <td className="delete-recipe-button-column">
                <img alt="Delete recipe"
                     src="https://breadsheet-public.s3-us-west-2.amazonaws.com/button_minus.png"
                     className="delete-recipe-button"
                     onClick={handleDeleteRecipe}/>
            </td>
            <td className="recipe-list-item-name">
                <Link to={`/recipe/${props.id}`}>{props.name}</Link>
            </td>
            <td>{props.difficulty}</td>
            <td>{props.length}</td>
            <td>{props.author}</td>
            <td>{props.source}</td>
        </tr>
    )
}

export default RecipeListItem;
