import React from 'react';

function map_difficulty_to_icon(difficulty) {
    if (difficulty === "Beginner") {
        return <img src="./difficulty-1-tsp.png"
                    alt={"Difficulty: " + difficulty}
                    className="difficulty-icon"/>

    } else if (difficulty === "Intermediate") {
        return <img src="./difficulty-2-tsp.png"
                    alt={"Difficulty: " + difficulty}
                    className="difficulty-icon"/>

    } else if (difficulty === "Advanced") {
        return <img src="./difficulty-3-tsp.png"
                    alt={"Difficulty: " + difficulty}
                    className="difficulty-icon"/>

    } else if (difficulty === "Iron Chef") {
        return <img src="./difficulty-4-tsp.png"
                    alt={"Difficulty: " + difficulty}
                    className="difficulty-icon"/>
    } else {
        // console.log("Unable to map difficulty icon for", difficulty);
        return ""
    }
}

export default map_difficulty_to_icon;
