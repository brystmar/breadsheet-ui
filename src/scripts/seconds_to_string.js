// Converts a raw number of seconds (int) to a human-readable string
//   in hours & minutes.  For inputs >36 hours, only the number of
//   days are returned.

// import moment from 'moment';

function seconds_to_string(seconds) {
    console.log("Starting seconds_to_string(" + seconds + ").");

    let result = "";

    if (seconds <= 0) {
        console.log("Finished seconds_to_string(), returning --.")
        return '--'
    }

    if (seconds >= 129600) {
        // For >36 hours, only display the number of days
        result = Math.round(seconds / 86400) + " days";
    }
    else {
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor(seconds / 60) % 60;

        // Build the hours string
        if (hours === 0) {
            result = "";
        }
        else if (hours === 1) {
            result = hours + " hr";
        }
        else {
            result = hours + " hrs";
        }

        // Build the minutes string
        if (minutes === 0) {
            result += "";
        }
        else if (result === "") {
            result = minutes + " min";
        }
        else {
            result += " " + minutes + " min";
        }
    }

    console.log("Finished seconds_to_string(" + seconds + "), result: " + result + ".");
    return result;
}

export default seconds_to_string;
