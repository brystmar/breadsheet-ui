// Converts a raw number of seconds (int) to a human-readable string
//   in hours & minutes.  For inputs >36 hours, only the number of
//   days are returned by default.

// import moment from 'moment';

function seconds_to_string(seconds, ExactValue= false) {
    let result = "";

    // Null handling
    if (seconds.isNaN || seconds <= 0 || seconds === "") {
        return '--'
    }

    if (!ExactValue && seconds >= 129600) {
        // For >36 hours, only display the number of days by default
        result = Math.round(seconds / 86400) + " days";
        return result;
    }
    else {
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor(seconds / 60) % 60;

        // Round up for 30+ minutes
        if (minutes >= 30) {
            hours += 1;
        }

        // Build the hours string
        if (hours === 0) {
            result += "";
        }
        else if (hours === 1) {
            result += hours + " hour";
        }
        else {
            result = hours + " hours";
        }

        // Build the minutes string
        // if (minutes === 0) {
        //     result += "";
        // }
        // else if (result === "") {
        //     result = minutes + " min";
        // }
        // else {
        //     result += " " + minutes + " min";
        // }
    }

    // console.log("Finished seconds_to_string(" + seconds + "), result: " + result + ".");
    return result;
}

export default seconds_to_string;
