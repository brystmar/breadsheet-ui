import React from 'react';

function map_difficulty_to_icon(difficulty) {
    if (difficulty === "Beginner") {
        return <img src="./icons/difficulty-1-tsp.png"
                    alt={"Difficulty: " + difficulty}
                    className="icon difficulty-icon"/>

    } else if (difficulty === "Intermediate") {
        return <img src="./icons/difficulty-2-tsp.png"
                    alt={"Difficulty: " + difficulty}
                    className="icon difficulty-icon"/>

    } else if (difficulty === "Advanced") {
        return <img src="./icons/difficulty-3-tsp.png"
                    alt={"Difficulty: " + difficulty}
                    className="icon difficulty-icon"/>

    } else if (difficulty === "Iron Chef") {
        return <img src="./icons/difficulty-4-tsp.png"
                    alt={"Difficulty: " + difficulty}
                    className="icon difficulty-icon"/>
    } else {
        // console.log("Unable to map difficulty icon for", difficulty);
        return ""
    }
}

export default map_difficulty_to_icon;
