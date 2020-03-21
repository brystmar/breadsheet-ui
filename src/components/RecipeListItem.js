import React from 'react';
import {Link} from 'react-router-dom';

function RecipeListItem(props) {
    function handleDeleteRecipe() {
        console.log("Attempting to delete recipe " + props.id);

        // Send a POST request to the API
        fetch("http://localhost:5000/api/v1/recipes/" + props.id, {
            method: "DELETE"
        })
            .then(response => {
                if (response.ok) {
                    console.log("Delete successful for: " + props.name + " (" + props.id + ")");
                    props.delete_recipe(props.id);
                }
                else {
                    console.log("Delete failed for: " + props.name + " (" + props.id + ")");
                }
            });
    }

    return (
        <tr className="recipe-list-item" id={"recipe-list-item-" + props.id}>
            <td className="delete-recipe-button-column">
                <img alt="Delete recipe"
                     src="https://breadsheet-public.s3-us-west-2.amazonaws.com/button_minus.png"
                     className="delete-recipe-button"
                     onClick={handleDeleteRecipe}/>
            </td>
            <td className="recipe-list-item-name">
                <Link to={`/recipe/${props.id}`}>{props.name}</Link>
            </td>
            <td className="recipe-list-item-difficulty">{props.difficulty}</td>
            <td className="recipe-list-item-length">{props.length}</td>
            <td className="recipe-list-item-author">{props.author}</td>
            <td className="recipe-list-item-source">{props.source}</td>
        </tr>
    )
}

export default RecipeListItem;
