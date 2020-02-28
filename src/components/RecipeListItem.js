import React from 'react';

function RecipeListItem(props) {
    return (
        <tr className="recipe-list-item">
            <td className="delete-recipe">
                <button id="delButton"
                        className="deleteButtonClass"
                        onClick={deleteRecipe(props.id)}>DEL
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

function deleteRecipe(recipe_id) {
    // TODO: Figure out wtf this function runs by itself nonstop!!
    // Send a POST request to the API
    // fetch("http://localhost:5000/api/v1/recipes/" + recipe_id, {
    //     method: "DELETE"
    // })
    //     .then(response => {
    //         console.log("POST complete!");
    //         console.log(JSON.stringify(recipe_id))
    //     });

    // Refresh the page
    // window.location.reload(true);
}

export default RecipeListItem;
