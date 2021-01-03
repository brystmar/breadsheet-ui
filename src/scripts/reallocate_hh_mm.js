import {pad} from "./time_display_functions";

function reallocate_hh_mm(event, providedHours, providedMinutes) {
    // Re-calculates hours/minutes when providedMinutes >= 60
    const {name, value} = event.target;
    const numValue = Number(value);
    console.log("Reallocate hh/mm:", name, value, numValue);

    // Re-allocate minutes if thenWaitMM value is >= 60
    if (name === "thenWaitMM" && numValue >= 60) {
        let newHours = Math.floor(numValue / 60) + Number(providedHours);
        let newMinutes = numValue % 60;

        return {
            thenWaitHH: pad(newHours),
            thenWaitMM: pad(newMinutes)
        }
    } else if (numValue >= 0 && numValue < 10) {
        if (name === "thenWaitMM") {
            return {
                thenWaitHH: providedHours,
                thenWaitMM: pad(value)
            }
        } else {
            return {
                thenWaitHH: pad(value),
                thenWaitMM: providedMinutes
            }
        }
    } else if (value.length >= 3 && value.toString().charAt(0) === "0") {
        // Remove unnecessary leading zeroes
        if (name === "thenWaitMM") {
            return {
                thenWaitHH: providedHours,
                thenWaitMM: numValue
            }
        } else {
            return {
                thenWaitHH: numValue,
                thenWaitMM: providedMinutes
            }
        }
    } else {
        return {
            thenWaitHH: providedHours,
            thenWaitMM: providedMinutes
        }
    }
}

export default reallocate_hh_mm;
