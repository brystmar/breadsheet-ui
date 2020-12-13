import {pad} from "./time_display_functions";

function reallocate_hh_mm(event, providedHours, providedMinutes, updateFunction) {
    // Re-calculates hours/minutes when providedMinutes >= 60
    const {name, value} = event.target;
    const numValue = Number(value);

    // Re-allocate minutes if thenWaitMM value is >= 60
    if (name === "thenWaitMM" && numValue >= 60) {
        let newHours = Math.floor(numValue / 60) + Number(providedHours);
        let newMinutes = numValue % 60;

        updateFunction({
            thenWaitHH: pad(newHours),
            thenWaitMM: pad(newMinutes)
        })
    } else if (numValue >= 0 && numValue < 10) {
        updateFunction({
            [name]: pad(value)
        })
    } else if (value.length >= 3 && value.toString().charAt(0) === "0") {
        // In case user enters an unnecessary leading zero
        updateFunction({
            [name]: numValue
        })
    }
}

export default reallocate_hh_mm;
