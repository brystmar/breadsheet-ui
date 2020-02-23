import React from 'react';

function RecipeListItem(props) {
    return (
        <tr className="recipe-list-item">
            <td className="recipe-list-item-name">
                <a href={"/recipe=" + props.id}>{props.name}</a>
            </td>
            <td>{props.author}</td>
            <td>{props.source}</td>
            <td>{props.difficulty}</td>
            <td>{props.added}</td>
        </tr>
    )
}

export default RecipeListItem;
