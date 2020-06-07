import React from 'react';
import seconds_to_string from '../scripts/time_display_functions';
import map_difficulty_to_icon from '../scripts/map_difficulty_to_icon';

function RecipeDetailAttributes(props) {
    return (
        <table className="recipe-detail-summary-table">
            <tbody>
            <tr>
                <td className="recipe-detail-summary-table-label">Difficulty</td>
                <td className="recipe-detail-summary-table-value">
                    {props.difficulty} {map_difficulty_to_icon(props.difficulty)}
                </td>
                <td className="recipe-detail-summary-table-label">Author</td>
                <td className="recipe-detail-summary-table-value">
                    {props.author}
                </td>
            </tr>
            <tr>
                <td className="recipe-detail-summary-table-label">Total Time</td>
                <td className="recipe-detail-summary-table-value">
                    {seconds_to_string(props.length ? props.length : 0, true, true, true)}
                </td>
                <td className="recipe-detail-summary-table-label">Source</td>
                <td className="recipe-detail-summary-table-value">
                    {props.source}
                </td>
            </tr>
            </tbody>
        </table>
    )
}

export default RecipeDetailAttributes;
