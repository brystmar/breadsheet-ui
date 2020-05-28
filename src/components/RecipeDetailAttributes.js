import React from 'react';
import seconds_to_string from '../scripts/time_display_functions';

function RecipeDetailAttributes(props) {
    let difficulty;

    if (props.difficulty === "Beginner") {
        difficulty = <img src="%PUBLIC_URL%/difficulty-1-tsp.png"
                          alt={"Difficulty: " + props.difficulty}
                          className="difficulty-icon"/>

    } else if (props.difficulty === "Intermediate") {
        difficulty = <img src="%PUBLIC_URL%/difficulty-2-tsp.png"
                          alt={"Difficulty: " + props.difficulty}
                          className="difficulty-icon"/>

    } else if (props.difficulty === "Advanced") {
        difficulty = <img src="%PUBLIC_URL%/difficulty-3-tsp.png"
                          alt={"Difficulty: " + props.difficulty}
                          className="difficulty-icon"/>

    } else if (props.difficulty === "Iron Chef") {
        difficulty = <img src="%PUBLIC_URL%/difficulty-4-tsp.png"
                          alt={"Difficulty: " + props.difficulty}
                          className="difficulty-icon"/>
    }

    return (
        <table className="recipe-detail-summary-table">
            <tbody>
            <tr>
                <td className="recipe-detail-summary-table-label">Difficulty</td>
                <td className="recipe-detail-summary-table-value">
                    {props.difficulty} {difficulty}
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
