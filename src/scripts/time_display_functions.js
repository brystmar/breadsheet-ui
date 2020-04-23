// Helper functions to tweak the display of various time-based elements

function seconds_to_string(seconds, IncludeDays = false,
                           IncludeHours = true,
                           IncludeMinutes = true) {
    // Converts a raw number of seconds (int) to a human-readable string
    //   in days, hours, and/or minutes.

    // Null handling
    if (seconds.isNaN || seconds <= 0 || seconds === "") {
        return "";
    }

    let result = "";
    let days = Math.floor(seconds / 86400);
    let hours = Math.floor(seconds / 3600) % 24;
    let minutes = Math.floor(seconds / 60) % 60;

    if (days + hours === 0 && !IncludeMinutes) {
        return "< 1 hour";
    }

    if (!IncludeHours && hours >= 12) {
        // Round days up for 12+ hours
        days += 1;
    }

    if (!IncludeMinutes && minutes >= 30) {
        // Round hours up for 30+ minutes
        hours += 1;
    }

    // Start building the result string
    if (IncludeDays && days > 0) {
        if (days === 1) {
            result = days.toString() + " day";
        } else {
            result = days.toString() + " days";
        }

        if (!IncludeHours) {
            // Won't include minutes without hours
            if (result.length === 0) {
                return "<1 hour";
            }
            return result;
        }

        if (hours > 0 || minutes > 0) {
            // Prep for adding the next string
            result += ", ";
        }
    }

    // Build the hours string
    if (IncludeHours && hours > 0) {
        if (hours === 1) {
            result += hours.toString() + " hour";
        } else {
            result += hours.toString() + " hours";
        }
    }

    if (!IncludeMinutes || minutes === 0) {
        return result;
    }

    // Prep for adding the minutes string
    if (result.length > 0) {
        result += ", ";
    }

    result += minutes.toString() + " min";

    // console.log("Finished seconds_to_string(", seconds, IncludeDays, IncludeHours,
    //   IncludeMinutes, "), result: " + result + ".");
    return result;
}

function seconds_to_hhmm(seconds) {
    // Input: a raw number of seconds (int)
    // Output: a zero-padded number of hours (str), and a zero-padded number of minutes (str).
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds - (hours * 3600)) / 60);

    return [pad(hours, 2), pad(minutes, 2)];
}

function pad(input, desiredLength = 2) {
    input = input.toString();
    while (input.length < desiredLength) {
        input = "0" + input;
    }
    return input;
}

export default seconds_to_string;
export {seconds_to_hhmm, pad};
