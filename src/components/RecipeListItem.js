import React from 'react';

function RecipeListItem(props) {
    function handleDeleteRecipe() {
        console.log("Atttempting to delete recipe " + props.id);

        // Send a POST request to the API
        fetch("http://localhost:5000/api/v1/recipes/" + props.id, {
            method: "DELETE"
        })
            .then(response => {
                if (response.ok) {
                    console.log("Delete successful for: " + props.name + " (" + props.id + ")");
                }
            });

        props.delete_recipe(props.id);
    }

    return (
        <tr className="recipe-list-item" id={"recipe-list-item-" + props.id}>
            <td className="delete-recipe-button-column">
                <button
                    className="delete-recipe-button"
                    onClick={handleDeleteRecipe}>-
                </button>
            </td>
            <td className="recipe-list-item-name">
                <a href={"/recipe?id=" + props.id}>{props.name}</a>
            </td>
            <td>{props.difficulty}</td>
            <td>{props.length}</td>
            <td>{props.author}</td>
            <td>{props.source}</td>
        </tr>
    )
}

export default RecipeListItem;
