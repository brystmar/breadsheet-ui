import React from 'react';
import seconds_to_string from "../scripts/seconds_to_string";

function RecipeDetailAttributes(props) {
    return (
        <table className="recipe-detail-summary-table">
            <tbody>
            <tr>
                <td className="recipe-detail-summary-table-label">Difficulty</td>
                <td className="recipe-detail-summary-table-value">
                    {props.difficulty}
                </td>
                <td className="recipe-detail-summary-table-label">Source</td>
                <td className="recipe-detail-summary-table-value">
                    {props.source}
                </td>
            </tr>
            <tr>
                <td className="recipe-detail-summary-table-label">Total Time</td>
                <td className="recipe-detail-summary-table-value">
                    {seconds_to_string(props.length, true)}
                </td>
                <td className="recipe-detail-summary-table-label">Author</td>
                <td className="recipe-detail-summary-table-value">
                    {props.author}
                </td>
            </tr>
            </tbody>
        </table>
    )
}

export default RecipeDetailAttributes;
