import React from 'react';

function RecipeListItem(props) {
    return (
        <tr className="recipe-list-item">
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
